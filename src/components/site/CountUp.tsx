"use client";

import { useEffect, useRef, useState } from "react";

/** 처음 화면에 들어올 때 숫자가 올라간다. 서버·모션 감소 환경에서는 최종값을 그대로 보여준다. */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
    const m = /^(\d+(?:\.\d+)?)$/.exec(value.trim());
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!m || reduce || !el || typeof IntersectionObserver === "undefined") return;
    const target = Number(m[1]);
    const decimals = m[1].includes(".") ? m[1].split(".")[1].length : 0;
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1200;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        setText((target * eased).toFixed(decimals));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden="true">{text}</span>
    </span>
  );
}
