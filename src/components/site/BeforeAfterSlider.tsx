"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { PublicImage } from "@/lib/data/public";

export function BeforeAfterSlider({ before, after, alt }: { before: PublicImage; after: PublicImage; alt: string }) {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const fromPointer = (e: PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(clamp(Math.round(((e.clientX - r.left) / r.width) * 100)));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") setPos((p) => clamp(p + 5));
    else if (e.key === "ArrowLeft") setPos((p) => clamp(p - 5));
    else if (e.key === "Home") setPos(0);
    else if (e.key === "End") setPos(100);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={box}
      className="relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden bg-line"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <Image src={after.url} alt={`${alt} 시공 후`} fill sizes="(min-width: 1024px) 720px, 100vw" className="pointer-events-none object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before.url} alt={`${alt} 시공 전`} fill sizes="(min-width: 1024px) 720px, 100vw" className="pointer-events-none object-cover" />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 bg-ink/70 px-2 py-1 text-xs tracking-widest text-bg">BEFORE</span>
      <span className="pointer-events-none absolute right-3 top-3 bg-ink/70 px-2 py-1 text-xs tracking-widest text-bg">AFTER</span>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-bg" style={{ left: `${pos}%` }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label={`${alt} 시공 전후 비교`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pos}
        aria-valuetext={`시공 전 ${pos}% 표시`}
        onKeyDown={onKey}
        className="absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-bg bg-ink/80 text-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={{ left: `${pos}%` }}
      >
        <span aria-hidden="true" className="text-sm">⟷</span>
      </div>
    </div>
  );
}
