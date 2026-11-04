"use client";

import { track } from "@/lib/analytics";

export function KakaoFloat({ url }: { url: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("click_kakao")}
      className="fixed bottom-8 right-8 z-40 hidden min-h-12 items-center border border-ink bg-surface px-6 text-sm font-medium shadow-sm transition-colors hover:bg-ink hover:text-bg md:flex"
    >
      카카오톡 상담
    </a>
  );
}
