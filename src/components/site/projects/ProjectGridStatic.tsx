import type { ProjectCard as Card } from "@/lib/data/public";
import { ProjectCard } from "../ProjectCard";

/** 필터 없는 전체 목록. 서버 HTML(크롤러·JS 없는 방문자)과 ProjectGrid 양쪽이 같은 마크업을 쓴다. */
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
      <p className="mt-8 border-t border-line pt-6 text-sm text-muted">{projects.length}개의 사례</p>
      <ProjectList projects={projects} />
    </div>
  );
}
