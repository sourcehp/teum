"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SortableList } from "@/components/admin/SortableList";
import { Toast } from "@/components/admin/Toast";

export type EntityBadge = { text: string; tone: "on" | "off" | "accent" | "warn" };
export type EntityRow = { id: string; title: string; subtitle?: string; badges: EntityBadge[] };

const TONES: Record<EntityBadge["tone"], string> = {
  on: "bg-green-50 text-green-800",
  accent: "bg-accent/15 text-accent-ink",
  warn: "bg-blue-50 text-blue-800",
  off: "bg-line text-muted",
};

function Content({ row, href }: { row: EntityRow; href: string }) {
  return (
    <Link href={href} className="block min-w-0 flex-1 py-1">
      <span className="block truncate font-medium">{row.title}</span>
      {row.subtitle ? <span className="block truncate text-xs text-muted">{row.subtitle}</span> : null}
      <span className="mt-1 flex flex-wrap items-center gap-1.5">
        {row.badges.map((b) => (
          <span key={b.text} className={`inline-block px-2 py-0.5 text-xs font-medium ${TONES[b.tone]}`}>
            {b.text}
          </span>
        ))}
      </span>
    </Link>
  );
}

/** 한 줄짜리 관리 목록. reorder 가 있으면 끌어서 순서를 바꿀 수 있다. */
export function EntityList({
  rows,
  basePath,
  reorder,
}: {
  rows: EntityRow[];
  basePath: string;
  reorder?: (ids: string[]) => Promise<void>;
}) {
  const router = useRouter();
  const [err, setErr] = useState<{ n: number } | null>(null);

  if (!reorder) {
    return (
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center border border-line bg-surface p-3">
            <Content row={r} href={`${basePath}/${r.id}`} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <>
      <SortableList
        className="space-y-2"
        items={rows}
        onReorder={async (ids) => {
          try {
            await reorder(ids);
            router.refresh();
          } catch {
            setErr({ n: Date.now() });
            throw new Error("reorder failed"); // SortableList 가 이전 순서로 되돌린다
          }
        }}
        renderItem={(r, handle) => (
          <div className="flex items-center gap-2 border border-line bg-surface p-2 pr-3">
            {handle}
            <Content row={r} href={`${basePath}/${r.id}`} />
          </div>
        )}
      />
      {err ? <Toast key={err.n} kind="error" message="순서를 저장하지 못했습니다. 새로고침 후 다시 시도해 주세요" /> : null}
    </>
  );
}
