import type { z } from "zod";

export type SaveState = { ok: boolean; id?: string; fieldErrors?: Record<string, string>; error?: string };

export const GENERIC_ERROR = "저장하지 못했습니다. 잠시 후 다시 시도해 주세요";

/** 검사 오류를 항목별 첫 메시지로 모은다. */
export function fieldErrorsOf(error: z.ZodError): SaveState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, fieldErrors, error: "입력 내용을 확인해 주세요" };
}
