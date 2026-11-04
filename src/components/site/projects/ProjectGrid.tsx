"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { ProjectCard as Card } from "@/lib/data/public";
import { filterProjects, filterToQuery, parseProjectFilter, type ProjectFilter } from "@/lib/project-filters";
import { ProjectCard } from "../ProjectCard";
import { ProjectFilters } from "./ProjectFilters";

export function ProjectGrid({ projects }: { projects: Card[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filter = useMemo(() => parseProjectFilter(new URLSearchParams(sp.toString())), [sp]);
  const shown = useMemo(() => filterProjects(projects, filter), [projects, filter]);

  const apply = (next: ProjectFilter) => {
    const q = filterToQuery(next);
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  return (
    <div>
      <ProjectFilters filter={filter} onChange={apply} />
      <p className="mt-8 border-t border-line pt-6 text-sm text-muted" aria-live="polite">
        {shown.length}개의 사례
      </p>
      {shown.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg">조건에 맞는 사례가 없습니다</p>
          <button
            type="button"
            onClick={() => apply({})}
            className="mt-6 inline-flex min-h-11 items-center justify-center border border-ink px-6 text-sm font-medium hover:bg-ink hover:text-bg"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <li key={p.id}>
              <ProjectCard project={p} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
