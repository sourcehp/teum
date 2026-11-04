import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";

// 로컬 Supabase 전용. 운영 DB를 가리키지 않도록 접속 주소를 고정한다.
const LOCAL_DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

export const LOCAL_ADMIN = { email: "admin@teum.local", password: "teum-local-admin-1!" } as const;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (.env.test)`);
  return value;
}

export const RPC_SECRET = env("INQUIRY_RPC_SECRET");

export function anonClient(): SupabaseClient {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function signedInClient(email: string, password: string): Promise<SupabaseClient> {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return client;
}

export function adminClient(): Promise<SupabaseClient> {
  return signedInClient(LOCAL_ADMIN.email, LOCAL_ADMIN.password);
}

const db = postgres(LOCAL_DB_URL, { max: 1, idle_timeout: 1, onnotice: () => {} });

/** 테스트 준비·정리용 직접 SQL(postgres 역할, RLS 우회). */
export async function sql<T extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const rows = await db.unsafe(query, params as never[]);
  return rows as unknown as T[];
}

/** 1단계 RPC 없이 문의 1건을 직접 만든다. */
export async function insertInquiry(fields: { ipHash?: string } = {}): Promise<string> {
  const [row] = await sql<{ id: string }>(
    `insert into public.inquiries (name, phone, space_type, privacy_agreed_at, ip_hash)
     values ('테스트', '010-0000-0000', 'residential', now(), $1)
     returning id`,
    [fields.ipHash ?? `test-${crypto.randomUUID()}`],
  );
  return row.id;
}
