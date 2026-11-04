"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Phase = "ssr" | "hidden" | "shown";

/**
 * 화면에 들어올 때 가운데 틈이 벌어지며 드러나는 모션.
 * 서버 렌더와 JS 없는 환경에서는 그대로 보이고, 마운트 후 모션이 허용될 때만 가린다.
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("ssr");

  useLayoutEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") return;
    setPhase("hidden");
  }, []);

  useEffect(() => {
    if (phase !== "hidden") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("shown");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase]);

  const style =
    phase === "ssr"
      ? undefined
      : {
          clipPath: phase === "hidden" ? "inset(0 50% 0 50%)" : "inset(0 0 0 0)",
          transition: "clip-path 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        };

  return (
    // 관찰 대상은 clip-path가 없는 바깥 요소여야 한다. 잘린 요소는 교차 면적이 0으로 계산돼 영영 나타나지 않는다.
    <div ref={ref} className={className}>
      <div style={style}>{children}</div>
    </div>
  );
}
