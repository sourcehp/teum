"use client";

import { useActionState } from "react";
import { FormField } from "@/components/admin/FormField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { changePassword, type PasswordState } from "./actions";

export function PasswordForm() {
  const [state, action] = useActionState<PasswordState, FormData>(changePassword, { ok: false });
  return (
    <form action={action} className="max-w-md space-y-4">
      <FormField label="새 비밀번호" name="password" type="password" autoComplete="new-password" required minLength={10} hint="10자 이상" />
      <FormField label="새 비밀번호 확인" name="confirm" type="password" autoComplete="new-password" required minLength={10} />
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-green-800" : "text-red-700"}`}>
          {state.message}
        </p>
      ) : null}
      <SubmitButton pendingText="변경 중…">비밀번호 변경</SubmitButton>
    </form>
  );
}
