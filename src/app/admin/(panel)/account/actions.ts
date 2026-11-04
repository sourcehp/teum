"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { validateNewPassword } from "@/lib/admin/password";

export type PasswordState = { ok: boolean; message?: string };

export async function changePassword(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const { supabase } = await requireAdmin();
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const invalid = validateNewPassword(password, confirm);
  if (invalid) return { ok: false, message: invalid };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (/different from the old/i.test(error.message)) {
      return { ok: false, message: "현재 비밀번호와 다른 비밀번호를 입력해 주세요" };
    }
    if (/weak|least|characters/i.test(error.message)) {
      return { ok: false, message: "사용할 수 없는 비밀번호입니다. 더 길고 추측하기 어려운 비밀번호를 입력해 주세요" };
    }
    return { ok: false, message: "비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요" };
  }
  return { ok: true, message: "비밀번호를 변경했습니다" };
}
