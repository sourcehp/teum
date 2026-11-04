"use server";

import { headers } from "next/headers";
import { createPublicClient } from "@/lib/supabase/public";
import { step1Schema, step2Schema } from "./schema";
import { checkSpam } from "./spam";
import { createDetailToken, hashIp, hashToken } from "./token";
import { notifyNewInquiry } from "./notify";

export type Step1State =
  | { status: "idle" }
  | { status: "success"; inquiryId: string; token: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

export type Step2State =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

const GENERIC_ERROR = "일시적인 오류입니다. 전화로 연락 주세요";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in out)) out[key] = issue.message;
  }
  return out;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "unknown";
}

export async function submitInquiryStep1(_prev: Step1State, fd: FormData): Promise<Step1State> {
  const values = { name: str(fd, "name"), phone: str(fd, "phone"), space_type: str(fd, "space_type"), privacy: str(fd, "privacy") };

  const spam = checkSpam({ honeypot: str(fd, "website"), renderedAt: str(fd, "rendered_at") === "" ? null : Number(str(fd, "rendered_at")), now: Date.now() });
  if (spam === "honeypot") return { status: "success", inquiryId: crypto.randomUUID(), token: "" };
  if (spam === "too_fast") return { status: "error", message: "잠시 후 다시 시도해 주세요", values };

  const parsed = step1Schema.safeParse({ ...values, privacy: values.privacy });
  if (!parsed.success) {
    return { status: "error", message: "입력 내용을 확인해 주세요", fieldErrors: fieldErrors(parsed.error.issues), values };
  }
  const input = parsed.data;

  const { token, hash } = createDetailToken();
  const orNull = (k: string) => str(fd, k).trim().slice(0, 500) || null;
  const supabase = createPublicClient();
  const secret = process.env.INQUIRY_RPC_SECRET ?? "";

  // 생성 타입은 선택 인자도 string으로 요구하지만 SQL은 null을 받아 NULL로 저장한다.
  const nullable = (v: string | null) => v as unknown as string;
  const { data, error } = await supabase.rpc("submit_inquiry_step1", {
    p_secret: secret,
    p_name: input.name,
    p_phone: input.phone,
    p_space_type: input.space_type,
    p_ip_hash: hashIp(await clientIp(), process.env.IP_HASH_SALT ?? ""),
    p_token_hash: hash,
    p_utm_source: nullable(orNull("utm_source")),
    p_utm_medium: nullable(orNull("utm_medium")),
    p_utm_campaign: nullable(orNull("utm_campaign")),
    p_referrer: nullable(orNull("referrer")),
    p_landing_path: nullable(orNull("landing_path")),
  });

  if (error) {
    if (error.message.includes("rate_limited")) {
      return { status: "error", message: "짧은 시간에 너무 많은 문의가 접수되었습니다. 전화로 연락 주세요", values };
    }
    return { status: "error", message: GENERIC_ERROR, values };
  }
  const row = data?.[0];
  if (!row) return { status: "error", message: GENERIC_ERROR, values };

  // 알림 실패는 접수 성공에 영향을 주지 않는다.
  try {
    const result = await notifyNewInquiry(
      { id: row.id, name: input.name, phone: input.phone, space_type: input.space_type, created_at: new Date().toISOString() },
      row.notify_email || null,
    );
    await supabase.rpc("set_inquiry_notify_status", { p_secret: secret, p_id: row.id, p_status: result });
  } catch {
    // 무시: 문의 자체는 저장됨
  }

  return { status: "success", inquiryId: row.id, token };
}

export async function submitInquiryStep2(_prev: Step2State, fd: FormData): Promise<Step2State> {
  const parsed = step2Schema.safeParse({
    email: str(fd, "email"),
    region: str(fd, "region"),
    area_pyeong: str(fd, "area_pyeong"),
    budget_range: str(fd, "budget_range"),
    desired_start: str(fd, "desired_start"),
    message: str(fd, "message"),
  });
  if (!parsed.success) {
    return { status: "error", message: "입력 내용을 확인해 주세요", fieldErrors: fieldErrors(parsed.error.issues) };
  }
  const d = parsed.data;
  // 생성 타입은 선택 인자도 non-null로 요구하지만 SQL은 null을 받아 NULL로 저장한다.
  const nullable = <T>(v: T | undefined) => (v ?? null) as unknown as T;

  const { data, error } = await createPublicClient().rpc("submit_inquiry_step2", {
    p_secret: process.env.INQUIRY_RPC_SECRET ?? "",
    p_id: str(fd, "inquiry_id"),
    p_token_hash: hashToken(str(fd, "token")),
    p_email: nullable(d.email),
    p_region: nullable(d.region),
    p_area_pyeong: nullable(d.area_pyeong),
    p_budget_range: nullable(d.budget_range),
    p_desired_start: nullable(d.desired_start),
    p_message: nullable(d.message),
  });
  if (error) return { status: "error", message: GENERIC_ERROR };
  if (data !== true) return { status: "error", message: "입력 시간이 지났습니다. 추가 내용은 전화로 알려 주세요" };
  return { status: "success" };
}
