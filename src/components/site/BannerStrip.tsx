"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "teum_banner_closed";

export type BannerData = { id: string; message: string; link_url: string | null };

export function BannerStrip({ banner }: { banner: BannerData }) {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY) === banner.id) setClosed(true);
    } catch {
      // 저장소 접근 불가: 그대로 표시
    }
  }, [banner.id]);

  if (closed) return null;

  function close() {
    try {
      window.localStorage.setItem(KEY, banner.id);
    } catch {
      // 저장 실패해도 이번 방문에서는 닫는다.
    }
    setClosed(true);
  }

  const link = banner.link_url;
  const external = !!link && /^https?:\/\//.test(link);

  return (
    <div className="relative bg-ink text-bg">
      <div className="mx-auto flex min-h-10 max-w-[1200px] items-center justify-center px-12 py-2 text-center text-[13px] leading-snug">
        {link ? (
          external ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              {banner.message}
            </a>
          ) : (
            <Link href={link} className="underline-offset-4 hover:underline">
              {banner.message}
            </Link>
          )
        ) : (
          <span>{banner.message}</span>
        )}
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="배너 닫기"
        className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-bg/80 hover:text-bg focus-visible:outline-2 focus-visible:outline-bg"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 2l10 10M12 2L2 12" />
        </svg>
      </button>
    </div>
  );
}
