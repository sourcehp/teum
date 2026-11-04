import Link from "next/link";
import type { ProjectCard, PublicImage } from "@/lib/data/public";
import { BeforeAfterSlider } from "../BeforeAfterSlider";
import { Section } from "../Section";

export function BeforeAfterHighlight({
  data,
}: {
  data: { project: ProjectCard; before: PublicImage; after: PublicImage } | null;
}) {
  if (!data) return null;
  return (
    <Section eyebrow="BEFORE / AFTER" title="같은 공간, 달라진 하루" className="border-t border-line">
      <div className="grid items-end gap-8 md:grid-cols-[2fr_1fr] md:gap-12">
        <BeforeAfterSlider before={data.before} after={data.after} alt={data.project.title} />
        <div>
          <p className="text-xs tracking-wide text-muted">{data.project.location}</p>
          <h3 className="mt-2 text-xl font-medium leading-snug">{data.project.title}</h3>
          {data.project.summary ? <p className="mt-3 leading-relaxed text-muted">{data.project.summary}</p> : null}
          <p className="mt-4 text-sm text-muted">가운데 손잡이를 좌우로 움직여 비교해 보세요.</p>
          <Link href={`/projects/${data.project.slug}`} className="mt-6 inline-block border-b border-ink pb-1 text-sm font-medium hover:text-accent-ink">
            이 사례 자세히 보기
          </Link>
        </div>
      </div>
    </Section>
  );
}
