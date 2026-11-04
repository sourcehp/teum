import type { Metadata } from "next";
import { safeNextPath } from "@/lib/admin/next-path";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm border border-line bg-surface p-6 sm:p-8">
        <p className="text-xs tracking-[0.2em] text-accent-ink">TEUM DESIGN STUDIO</p>
        <h1 className="mt-2 text-xl font-semibold">관리자 로그인</h1>
        <p className="mt-1 text-sm text-muted">홈페이지 관리를 위해 로그인해 주세요.</p>
        <LoginForm next={safeNextPath(raw)} />
      </div>
    </main>
  );
}
