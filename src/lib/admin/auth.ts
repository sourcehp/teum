import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export { safeNextPath } from "./next-path";

/** 모든 관리자 서버 액션·페이지의 첫 줄에서 호출한다. 관리자가 아니면 로그인으로 보낸다. */
export async function requireAdmin(): Promise<{ supabase: SupabaseClient<Database>; userId: string }> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/admin/login");
  return { supabase, userId: data.user.id };
}
