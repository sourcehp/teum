"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/projects", label: "시공 사례" },
  { href: "/admin/testimonials", label: "고객 후기" },
  { href: "/admin/faqs", label: "FAQ" },
  { href: "/admin/banners", label: "이벤트 배너" },
  { href: "/admin/inquiries", label: "상담 문의", badge: true },
  { href: "/admin/stats", label: "유입 통계" },
  { href: "/admin/settings", label: "사이트 설정" },
  { href: "/admin/account", label: "내 계정" },
] as const;

export function AdminNav({
  newCount,
  signOutAction,
}: {
  newCount: number;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <aside className="border-b border-line bg-surface md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-4 py-3 md:block md:py-5">
        <Link href="/admin" className="block">
          <span className="block text-[10px] tracking-[0.2em] text-accent-ink">TEUM DESIGN STUDIO</span>
          <span className="text-base font-semibold">관리자</span>
        </Link>
        <button
          type="button"
          className="border border-line px-3 py-1.5 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "메뉴 닫기" : "메뉴 열기"}
        </button>
      </div>
      <div id="admin-menu" className={`${open ? "block" : "hidden"} px-2 pb-3 md:block`}>
        <nav aria-label="관리자 메뉴">
          <ul className="space-y-0.5">
            {ITEMS.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(it.href) ? "page" : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm ${
                    isActive(it.href) ? "bg-bg font-semibold text-ink" : "text-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  <span>{it.label}</span>
                  {"badge" in it && newCount > 0 ? (
                    <span
                      className="min-w-5 bg-accent-ink px-1.5 py-0.5 text-center text-xs font-semibold text-white"
                      aria-label={`신규 ${newCount}건`}
                    >
                      {newCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action={signOutAction} className="mt-3 border-t border-line pt-3">
          <button type="submit" className="w-full px-3 py-2.5 text-left text-sm text-muted hover:bg-bg hover:text-ink">
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
