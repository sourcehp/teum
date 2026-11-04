"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { Toast } from "@/components/admin/Toast";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import type { SaveState } from "@/lib/admin/form";

/** 후기·FAQ·배너 폼 공통 껍데기: 저장 상태, 미저장 경고, 토스트. children 은 항목별 오류 맵을 받는다. */
export function FormShell({
  action,
  submitLabel,
  resetKey,
  children,
}: {
  action: (prev: SaveState, fd: FormData) => Promise<SaveState>;
  submitLabel: string;
  resetKey: string;
  children: (fieldErrors: Record<string, string>, markDirty: () => void) => React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(action, { ok: false });
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    if (state.ok) {
      setDirty(false);
      setSavedAt(Date.now());
    }
  }, [state]);

  return (
    <form
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        e.preventDefault(); // 오류가 있어도 입력한 내용이 지워지지 않게 폼 자동 초기화를 쓰지 않는다.
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="space-y-5"
    >
      <UnsavedGuard dirty={dirty} />
      <fieldset key={resetKey} className="space-y-5">
        {children(state.fieldErrors ?? {}, () => setDirty(true))}
      </fieldset>
      {state.error && !state.ok ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:bg-accent-ink disabled:opacity-60"
        >
          {pending ? "저장 중…" : submitLabel}
        </button>
        {dirty ? <span className="text-xs text-muted">저장하지 않은 변경이 있습니다</span> : null}
      </div>
      <Toast key={savedAt} message={state.ok ? "저장했습니다" : null} />
    </form>
  );
}

export const inputCls =
  "mt-1 block w-full border border-line bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
