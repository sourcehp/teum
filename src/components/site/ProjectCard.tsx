import Image from "next/image";
import Link from "next/link";
import type { ProjectCard as Card } from "@/lib/data/public";
import { CATEGORY_LABELS } from "@/lib/domain/labels";
import { Reveal } from "./Reveal";

export function ProjectCard({ project, priority = false }: { project: Card; priority?: boolean }) {
  const meta = [CATEGORY_LABELS[project.category], project.area_pyeong ? `${project.area_pyeong}평` : null, project.location]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <Reveal>
        <div className="relative aspect-[4/3] overflow-hidden bg-line">
          {project.cover ? (
            <Image
              src={project.cover.url}
              alt={project.cover.alt || project.title}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div data-testid="cover-placeholder" className="h-full w-full bg-line" aria-hidden="true" />
          )}
        </div>
      </Reveal>
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-xs tracking-wide text-muted">{meta}</p>
        <h3 className="mt-1.5 text-lg font-medium leading-snug group-hover:text-accent-ink">{project.title}</h3>
      </div>
    </Link>
  );
}
