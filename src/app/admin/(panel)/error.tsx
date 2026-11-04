"use client";

import Link from "next/link";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="max-w-xl border border-line bg-surface p-6">
      <h1 className="text-lg font-semibold">처리 중 문제가 발생했습니다.</h1>
      <p className="mt-2 text-sm text-muted">잠시 후 다시 시도해 주세요. 문제가 계속되면 대시보드로 돌아가 주세요.</p>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={() => reset()} className="bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:bg-accent-ink">
          다시 시도
        </button>
        <Link href="/admin" className="border border-line px-5 py-2.5 text-sm hover:bg-bg">
          대시보드
        </Link>
      </div>
    </div>
  );
}
