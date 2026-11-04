"use client";

import { useActionState } from "react";
import { FormField } from "@/components/admin/FormField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { signIn } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, {} as { error?: string });
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <FormField label="이메일" name="email" type="email" autoComplete="username" required />
      <FormField label="비밀번호" name="password" type="password" autoComplete="current-password" required />
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <SubmitButton pendingText="로그인 중…" className="w-full">
        로그인
      </SubmitButton>
    </form>
  );
}
