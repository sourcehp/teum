"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitInquiryStep1, type Step1State } from "@/lib/inquiry/actions";
import { readAttribution } from "@/lib/attribution";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/domain/labels";

const field =
  "mt-2 block min-h-12 w-full border border-line bg-surface px-4 text-base text-ink placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent";
const label = "block text-sm font-medium";
const err = "mt-1.5 text-sm text-[#a33a2a]";

export function Step1Form({ onSuccess }: { onSuccess: (s: Extract<Step1State, { status: "success" }>) => void }) {
  const [state, action, pending] = useActionState<Step1State, FormData>(submitInquiryStep1, { status: "idle" });
  const [renderedAt, setRenderedAt] = useState("");
  const notified = useRef<unknown>(null);

  useEffect(() => {
    setRenderedAt(String(Date.now()));
  }, []);

  useEffect(() => {
    if (state.status === "success" && notified.current !== state) {
      notified.current = state;
      onSuccess(state);
    }
  }, [state, onSuccess]);

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const k = state.status === "error" ? JSON.stringify(values) : "init";

  function submit(fd: FormData) {
    let a: Record<string, string | null> = {};
    try {
      a = { ...readAttribution(window.sessionStorage) };
    } catch {
      // 저장소를 읽지 못해도 접수는 진행한다.
    }
    for (const n of ["utm_source", "utm_medium", "utm_campaign", "referrer", "landing_path"]) fd.set(n, a[n] ?? "");
    fd.set("rendered_at", renderedAt);
    return action(fd);
  }

  return (
    <form action={submit} noValidate className="space-y-6" key={k}>
      {state.status === "error" ? (
        <p role="alert" className="border border-[#a33a2a]/40 bg-surface px-4 py-3 text-sm text-[#a33a2a]">
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="q-name" className={label}>이름</label>
        <input id="q-name" name="name" type="text" autoComplete="name" maxLength={30} required defaultValue={values.name ?? ""}
          aria-invalid={!!errors.name} aria-describedby={errors.name ? "q-name-err" : undefined} className={field} />
        {errors.name ? <p id="q-name-err" className={err}>{errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="q-phone" className={label}>연락처</label>
        <input id="q-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" required defaultValue={values.phone ?? ""}
          aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "q-phone-err" : undefined} className={field} />
        {errors.phone ? <p id="q-phone-err" className={err}>{errors.phone}</p> : null}
      </div>

      <div>
        <label htmlFor="q-space" className={label}>공간 유형</label>
        <select id="q-space" name="space_type" required defaultValue={values.space_type ?? ""}
          aria-invalid={!!errors.space_type} aria-describedby={errors.space_type ? "q-space-err" : undefined} className={field}>
          <option value="" disabled>선택해 주세요</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        {errors.space_type ? <p id="q-space-err" className={err}>{errors.space_type}</p> : null}
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input id="q-privacy" name="privacy" type="checkbox" defaultChecked={!!values.privacy} className="mt-1 size-5 accent-[#8a6a4c]"
            aria-invalid={!!errors.privacy} aria-describedby={errors.privacy ? "q-privacy-err" : undefined} />
          <label htmlFor="q-privacy" className="text-sm leading-relaxed">
            개인정보 수집·이용 동의 (필수){" "}
            <Link href="/privacy" className="text-accent-ink underline underline-offset-2" target="_blank">내용 보기</Link>
          </label>
        </div>
        {errors.privacy ? <p id="q-privacy-err" className={err}>{errors.privacy}</p> : null}
      </div>

      {/* 스팸 방지용 숨김 입력: 사람은 보거나 채울 수 없다. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input type="hidden" name="rendered_at" value={renderedAt} readOnly />
      {["utm_source", "utm_medium", "utm_campaign", "referrer", "landing_path"].map((n) => (
        <input key={n} type="hidden" name={n} defaultValue="" />
      ))}

      <button type="submit" disabled={pending || !renderedAt}
        className="inline-flex min-h-12 w-full items-center justify-center bg-ink px-6 text-base font-medium tracking-wide text-bg transition-colors hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        {pending ? "접수 중…" : "무료 상담 신청"}
      </button>
    </form>
  );
}
