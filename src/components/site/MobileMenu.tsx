"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_ITEMS } from "./nav";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="메뉴 열기"
        onClick={() => setOpen(true)}
        className="-mr-2 flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-ink"
      >
        <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true" stroke="currentColor" strokeWidth="1.2">
          <path d="M0 1h22M0 13h22" />
        </svg>
      </button>

      {open
        ? createPortal(
        <div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="메뉴"
          className="fixed inset-0 z-50 flex flex-col bg-bg px-5"
        >
          <div className="flex h-16 items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted">Menu</span>
            <button
              type="button"
              onClick={close}
              aria-label="메뉴 닫기"
              className="-mr-2 flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-ink"
            >
              <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
          <nav aria-label="모바일 메뉴" className="mt-8 flex-1">
            <ul className="border-t border-line">
              {NAV_ITEMS.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link href={item.href} onClick={() => setOpen(false)} className="block py-5 text-2xl font-medium tracking-tight">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="pb-8">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center bg-ink text-sm font-medium tracking-wide text-bg"
            >
              무료 상담 신청
            </Link>
          </div>
        </div>,
        document.body,
      )
        : null}
    </div>
  );
}
