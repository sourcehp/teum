"use client";

import { useEffect } from "react";

/** 저장하지 않은 변경이 있을 때 창을 닫거나 새로고침하면 경고한다. */
export function UnsavedGuard({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  return null;
}
