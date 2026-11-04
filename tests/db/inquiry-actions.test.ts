import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { sql } from "./helpers";

const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": `${ip}, 192.168.0.1` }),
}));

import { submitInquiryStep1, submitInquiryStep2 } from "@/lib/inquiry/actions";

const names: string[] = [];
const uniq = () => {
  const n = `액션테스트-${crypto.randomUUID().slice(0, 8)}`;
  names.push(n);
  return n;
};

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}
const base = (name: string, extra: Record<string, string> = {}) => ({
  name,
  phone: "010 1234 5678",
  space_type: "residential",
  privacy: "on",
  website: "",
  rendered_at: String(Date.now() - 10_000),
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  referrer: "",
  landing_path: "/contact",
  ...extra,
});

beforeEach(async () => {
  // 속도 제한(IP당 10분 5건)에 걸리지 않도록 이 테스트가 만든 행만 정리한다.
  await sql(`delete from public.inquiries where name = any($1::text[])`, [names]);
});
afterAll(async () => {
  await sql(`delete from public.inquiries where name = any($1::text[])`, [names]);
});

describe("inquiry actions", () => {
  it("step1 success stores normalized phone and notify_status skipped", async () => {
    const name = uniq();
    const r = await submitInquiryStep1({ status: "idle" }, fd(base(name)));
    expect(r.status).toBe("success");
    if (r.status !== "success") return;
    expect(r.token.length).toBeGreaterThan(20);
    const [row] = await sql<{ phone: string; notify_status: string; utm_source: string | null }>(
      `select phone, notify_status, utm_source from public.inquiries where id = $1`, [r.inquiryId]);
    expect(row.phone).toBe("010-1234-5678");
    expect(row.notify_status).toBe("skipped");
    expect(row.utm_source).toBeNull();
  });

  it("honeypot returns success without inserting", async () => {
    const name = uniq();
    const r = await submitInquiryStep1({ status: "idle" }, fd(base(name, { website: "http://spam" })));
    expect(r.status).toBe("success");
    const [{ count }] = await sql<{ count: string }>(`select count(*) from public.inquiries where name = $1`, [name]);
    expect(count).toBe("0");
  });

  it("too fast submission is rejected", async () => {
    const name = uniq();
    const r = await submitInquiryStep1({ status: "idle" }, fd(base(name, { rendered_at: String(Date.now()) })));
    expect(r).toMatchObject({ status: "error", message: "잠시 후 다시 시도해 주세요" });
  });

  it("validation errors echo values and field errors", async () => {
    const r = await submitInquiryStep1({ status: "idle" }, fd(base("홍", { phone: "abc", privacy: "" })));
    expect(r.status).toBe("error");
    if (r.status !== "error") return;
    expect(r.fieldErrors?.phone).toBe("연락처 형식을 확인해 주세요");
    expect(r.values?.name).toBe("홍");
  });

  it("step2 with returned token stores details, and a second use is rejected", async () => {
    const name = uniq();
    const r = await submitInquiryStep1({ status: "idle" }, fd(base(name)));
    if (r.status !== "success") throw new Error("step1 failed");
    const step2 = { inquiry_id: r.inquiryId, token: r.token, email: "a@b.co", region: "서울", area_pyeong: "32", budget_range: "50m_100m", desired_start: "", message: "안녕하세요" };
    expect(await submitInquiryStep2({ status: "idle" }, fd(step2))).toEqual({ status: "success" });
    const [row] = await sql<{ email: string; region: string; area_pyeong: string; desired_start: string | null }>(
      `select email, region, area_pyeong, desired_start from public.inquiries where id = $1`, [r.inquiryId]);
    expect(row.email).toBe("a@b.co");
    expect(Number(row.area_pyeong)).toBe(32);
    expect(row.desired_start).toBeNull();
    const again = await submitInquiryStep2({ status: "idle" }, fd(step2));
    expect(again).toMatchObject({ status: "error", message: "입력 시간이 지났습니다. 추가 내용은 전화로 알려 주세요" });
  });
});
