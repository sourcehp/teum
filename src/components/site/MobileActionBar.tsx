"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { telHref } from "./nav";

export function MobileActionBar({ phone, kakaoUrl }: { phone: string; kakaoUrl: string }) {
  const cell = "flex min-h-14 flex-1 items-center justify-center text-sm font-medium";
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {phone ? (
        <a href={telHref(phone)} onClick={() => track("click_call")} className={`${cell} border-r border-line`}>
          전화
        </a>
      ) : null}
      {kakaoUrl ? (
        <a
          href={kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("click_kakao")}
          className={`${cell} border-r border-line`}
        >
          카카오톡
        </a>
      ) : null}
      <Link href="/contact" className={`${cell} bg-ink text-bg`}>
        상담 신청
      </Link>
    </div>
  );
}
