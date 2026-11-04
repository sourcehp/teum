"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { reorderProjects } from "@/app/admin/(panel)/projects/actions";
import { SortableList } from "@/components/admin/SortableList";
import { Toast } from "@/components/admin/Toast";
import { CATEGORY_LABELS, type Category } from "@/lib/domain/labels";

export type ProjectListItem = {
  id: string;
  title: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
  is_sample: boolean;
  cover_url: string | null;
};

function Badge({ children, tone }: { children: React.ReactNode; tone: "on" | "off" | "accent" }) {
  const cls = tone === "on" ? "bg-green-50 text-green-800" : tone === "accent" ? "bg-accent/15 text-accent-ink" : "bg-line text-muted";
  return <span className={`inline-block px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function ProjectList({ items }: { items: ProjectListItem[] }) {
  const router = useRouter();
  const [err, setErr] = useState<{ n: number } | null>(null);
  return (
    <>
      <SortableList
        className="space-y-2"
        items={items}
        onReorder={async (ids) => {
          try {
            await reorderProjects(ids);
            router.refresh();
          } catch {
            setErr({ n: Date.now() });
            throw new Error("reorder failed"); // SortableList 가 이전 순서로 되돌린다
          }
        }}
        renderItem={(p, handle) => (
          <div className="flex items-center gap-2 border border-line bg-surface p-2 pr-3">
            {handle}
            <Link href={`/admin/projects/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <span className="h-14 w-20 shrink-0 bg-line">
                {p.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[11px] text-muted">사진 없음</span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{p.title}</span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted">{CATEGORY_LABELS[p.category as Category] ?? p.category}</span>
                  <Badge tone={p.is_published ? "on" : "off"}>{p.is_published ? "공개" : "비공개"}</Badge>
                  {p.is_featured ? <Badge tone="accent">홈 노출</Badge> : null}
                  {p.is_sample ? <Badge tone="off">샘플</Badge> : null}
                </span>
              </span>
            </Link>
          </div>
        )}
      />
      {err ? <Toast key={err.n} kind="error" message="순서를 저장하지 못했습니다. 새로고침 후 다시 시도해 주세요" /> : null}
    </>
  );
}
