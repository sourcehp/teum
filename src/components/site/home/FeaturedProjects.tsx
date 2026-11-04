import Link from "next/link";
import type { ProjectCard as Card } from "@/lib/data/public";
import { ProjectCard } from "../ProjectCard";
import { Section } from "../Section";

export function FeaturedProjects({ projects, title }: { projects: Card[]; title: string }) {
  if (projects.length === 0) return null;
  return (
    <Section eyebrow="PROJECTS" title={title}>
      <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      <div className="mt-12">
        <Link href="/projects" className="border-b border-ink pb-1 text-sm font-medium hover:border-accent-ink hover:text-accent-ink">
          시공 사례 전체 보기
        </Link>
      </div>
    </Section>
  );
}
