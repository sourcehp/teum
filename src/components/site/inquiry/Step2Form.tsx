"use client";

import { startTransition, useActionState, useEffect } from "react";
import { submitInquiryStep2, type Step2State } from "@/lib/inquiry/actions";
import { BUDGET_LABELS, BUDGET_RANGES } from "@/lib/domain/labels";
import { track } from "@/lib/analytics";

const field =
  "mt-2 block min-h-12 w-full border border-line bg-surface px-4 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent";
const label = "block text-sm font-medium";
const err = "mt-1.5 text-sm text-[#a33a2a]";

export function Step2Form({
  inquiryId,
  token,
  initialMessage = "",
  onDone,
}: {
  inquiryId: string;
  token: string;
  initialMessage?: string;
  onDone: (kind: "saved" | "skipped") => void;
}) {
  const [state, action, pending] = useActionState<Step2State, FormData>(submitInquiryStep2, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      track("inquiry_detail");
      onDone("saved");
    }
  }, [state, onDone]);

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const e = (n: string) => (errors[n] ? `s2-${n}-err` : undefined);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // 오류가 있어도 입력한 내용이 지워지지 않게 폼 자동 초기화를 쓰지 않는다.
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      noValidate className="space-y-6">
      {state.status === "error" ? (
        <p role="alert" className="border border-[#a33a2a]/40 bg-surface px-4 py-3 text-sm text-[#a33a2a]">{state.message}</p>
      ) : null}
      <input type="hidden" name="inquiry_id" value={inquiryId} readOnly />
      <input type="hidden" name="token" value={token} readOnly />

      <div>
        <label htmlFor="s2-email" className={label}>이메일</label>
        <input id="s2-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={e("email")} className={field} />
        {errors.email ? <p id="s2-email-err" className={err}>{errors.email}</p> : null}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="s2-region" className={label}>지역</label>
          <input id="s2-region" name="region" type="text" placeholder="예: 서울 성동구" maxLength={50} aria-invalid={!!errors.region} aria-describedby={e("region")} className={field} />
          {errors.region ? <p id="s2-region-err" className={err}>{errors.region}</p> : null}
        </div>
        <div>
          <label htmlFor="s2-area" className={label}>평수</label>
          <input id="s2-area" name="area_pyeong" type="number" inputMode="decimal" min="1" step="any" placeholder="예: 32" aria-invalid={!!errors.area_pyeong} aria-describedby={e("area_pyeong")} className={field} />
          {errors.area_pyeong ? <p id="s2-area_pyeong-err" className={err}>{errors.area_pyeong}</p> : null}
        </div>
        <div>
          <label htmlFor="s2-budget" className={label}>예산 범위</label>
          <select id="s2-budget" name="budget_range" defaultValue="" aria-invalid={!!errors.budget_range} aria-describedby={e("budget_range")} className={field}>
            <option value="">선택 안 함</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>{BUDGET_LABELS[b]}</option>
            ))}
          </select>
          {errors.budget_range ? <p id="s2-budget_range-err" className={err}>{errors.budget_range}</p> : null}
        </div>
        <div>
          <label htmlFor="s2-start" className={label}>희망 시기</label>
          <input id="s2-start" name="desired_start" type="text" placeholder="예: 내년 3월" maxLength={50} aria-invalid={!!errors.desired_start} aria-describedby={e("desired_start")} className={field} />
          {errors.desired_start ? <p id="s2-desired_start-err" className={err}>{errors.desired_start}</p> : null}
        </div>
      </div>
      <div>
        <label htmlFor="s2-message" className={label}>문의 내용</label>
        <textarea id="s2-message" name="message" rows={5} maxLength={2000} defaultValue={initialMessage}
          aria-invalid={!!errors.message} aria-describedby={e("message")} className={`${field} py-3`} />
        {errors.message ? <p id="s2-message-err" className={err}>{errors.message}</p> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={pending}
          className="inline-flex min-h-12 flex-1 items-center justify-center bg-ink px-6 text-base font-medium text-bg transition-colors hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "저장 중…" : "추가 정보 보내기"}
        </button>
        <button type="button" onClick={() => onDone("skipped")} disabled={pending}
          className="inline-flex min-h-12 items-center justify-center border border-ink px-6 text-base text-ink transition-colors hover:bg-ink hover:text-bg disabled:opacity-60">
          건너뛰기
        </button>
      </div>
    </form>
  );
}
