"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "저장 중…",
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:bg-accent-ink disabled:opacity-60 ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
