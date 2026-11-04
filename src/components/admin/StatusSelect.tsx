"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Toast } from "@/components/admin/Toast";
import { INQUIRY_STATUSES, STATUS_LABELS } from "@/lib/domain/labels";
import { updateInquiry } from "@/app/admin/(panel)/inquiries/actions";

type State = { ok: boolean; error?: string; n: number };

/** 상담 상태와 메모를 저장하는 폼. */
export function StatusSelect({ id, status, memo }: { id: string; status: string; memo: string }) {
  const [state, action] = useActionState<State, FormData>(
    async (prev, fd) => ({ ...(await updateInquiry(id, { ok: false }, fd)), n: prev.n + 1 }),
    { ok: false, n: 0 },
  );
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="f-status" className="block text-sm font-medium">
          상태
        </label>
        <select
          id="f-status"
          name="status"
          defaultValue={status}
          className="mt-1 block w-full border border-line bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:w-56"
        >
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-admin_memo" className="block text-sm font-medium">
          메모
        </label>
        <textarea
          id="f-admin_memo"
          name="admin_memo"
          defaultValue={memo}
          rows={5}
          maxLength={5000}
          className="mt-1 block w-full border border-line bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-xs text-muted">직원끼리만 보는 메모입니다. 최대 5,000자.</p>
      </div>
      <SubmitButton>저장</SubmitButton>
      {state.n > 0 && state.ok ? <Toast key={state.n} message="저장했습니다" /> : null}
      {state.n > 0 && !state.ok ? <Toast key={state.n} kind="error" message={state.error ?? "저장하지 못했습니다"} /> : null}
    </form>
  );
}
