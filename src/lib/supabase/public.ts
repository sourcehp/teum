import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/** anon 키 클라이언트. 세션을 저장하지 않으므로 서버·서버 액션에서 공용으로 쓴다. */
export function createPublicClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
