import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { ProjectGridStatic } from "@/components/site/projects/ProjectGridStatic";
import { ProjectGrid } from "@/components/site/projects/ProjectGrid";
import { VisualWorkGrid, parseVisualWorks } from "@/components/site/VisualWorkGrid";
import { listPublishedProjects, getPublicSettings } from "@/lib/data/public";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "시공 사례",
  description: "틈디자인스튜디오가 설계·시공한 주거·상업·오피스 공간 사례를 모아 보세요.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([listPublishedProjects(), getPublicSettings()]);
  const visualWorks = parseVisualWorks(settings.visual_works);
  return (
    <div className="py-16 md:py-24">
      <Container>
        <header className="mb-10 md:mb-14">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-accent-ink">PROJECTS</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">시공 사례</h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            공간마다 다른 이야기를 담아 완성한 틈디자인스튜디오의 공간 디자인 사례입니다.
          </p>
        </header>
        <h2 className="sr-only">공간 디자인 사례 목록</h2>
        <Suspense fallback={<ProjectGridStatic projects={projects} />}>
          <ProjectGrid projects={projects} />
        </Suspense>
      </Container>

      {visualWorks.length > 0 ? (
        <Container id="visual" className="mt-20 scroll-mt-20 border-t border-line pt-16 md:mt-28 md:pt-20">
          <header className="mb-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-accent-ink">VISUAL IDENTITY</p>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">시각 디자인(BI)</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-muted">공간 디자인과 함께 진행한 로고·브랜드 디자인 작업입니다.</p>
          </header>
          <VisualWorkGrid items={visualWorks} />
        </Container>
      ) : null}
    </div>
  );
}
