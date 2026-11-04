"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/admin/next-path";
import { createServerSupabase } from "@/lib/supabase/server";

export async function signIn(_prev: { error?: string }, fd: FormData): Promise<{ error?: string }> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "이메일 또는 비밀번호가 올바르지 않습니다" };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "관리자 권한이 없는 계정입니다" };
  }
  redirect(safeNextPath(fd.get("next")));
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
