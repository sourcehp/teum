import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { ProjectGrid } from "@/components/site/projects/ProjectGrid";
import { listPublishedProjects } from "@/lib/data/public";

export const revalidate = 3600;
export const metadata: Metadata = { title: "시공 사례" };

export default async function ProjectsPage() {
  const projects = await listPublishedProjects();
  return (
    <div className="py-16 md:py-24">
      <Container>
        <header className="mb-10 md:mb-14">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-accent-ink">PROJECTS</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">시공 사례</h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            공간마다 다른 이야기를 담아 완성한 틈디자인스튜디오의 시공 사례입니다.
          </p>
        </header>
        <Suspense fallback={<p className="text-sm text-muted">사례를 불러오는 중입니다.</p>}>
          <ProjectGrid projects={projects} />
        </Suspense>
      </Container>
    </div>
  );
}
