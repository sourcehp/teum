import type { ProjectCard as Card } from "@/lib/data/public";
import { ProjectCard } from "../ProjectCard";
import { ProjectFilters } from "./ProjectFilters";

/** 필터 없는 전체 목록. 서버 HTML(크롤러·JS 없는 방문자)과 ProjectGrid 양쪽이 같은 마크업을 쓴다. */
export function ResultCount({ count }: { count: number }) {
  return (
    <p className="mt-8 border-t border-line pt-6 text-sm text-muted" aria-live="polite">
      {count}개의 사례
    </p>
  );
}

export function ProjectList({ projects }: { projects: Card[] }) {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <li key={p.id}>
          <ProjectCard project={p} priority={i < 3} />
        </li>
      ))}
    </ul>
  );
}

export function ProjectGridStatic({ projects }: { projects: Card[] }) {
  return (
    <div>
      <ProjectFilters filter={{}} />
      <ResultCount count={projects.length} />
      <ProjectList projects={projects} />
    </div>
  );
}
