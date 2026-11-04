import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { Button } from "@/components/site/Button";
import { Container } from "@/components/site/Container";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Section } from "@/components/site/Section";
import { TestimonialCard } from "@/components/site/TestimonialCard";
import { Gallery } from "@/components/site/projects/Gallery";
import { ProjectFacts } from "@/components/site/projects/ProjectFacts";
import {
  getProjectBySlug,
  getRelatedProjects,
  getTestimonials,
  listPublishedProjects,
} from "@/lib/data/public";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

function decodeSlug(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const list = await listPublishedProjects();
  return list.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeSlug((await params).slug);
  const project = slug ? await getProjectBySlug(slug) : null;
  return { title: project?.title ?? "시공 사례" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const slug = decodeSlug((await params).slug);
  if (!slug) notFound();
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [related, testimonials] = await Promise.all([
    getRelatedProjects(project, 3),
    getTestimonials({ projectId: project.id }),
  ]);
  const paragraphs = project.body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const hasBeforeAfter = project.before && project.after;

  return (
    <article>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-line md:aspect-[21/9]">
        {project.cover ? (
          <Image
            src={project.cover.url}
            alt={project.cover.alt || project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div data-testid="cover-placeholder" className="h-full w-full bg-line" aria-hidden="true" />
        )}
      </div>

      <Container className="py-12 md:py-16">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight [word-break:keep-all] [text-wrap:balance] md:text-5xl">{project.title}</h1>
        {project.summary ? <p className="mt-4 max-w-2xl leading-relaxed text-muted">{project.summary}</p> : null}
        <div className="mt-8">
          <ProjectFacts project={project} />
        </div>
        {paragraphs.length > 0 ? (
          <div className="mt-10 max-w-2xl space-y-5 leading-8 [word-break:keep-all]">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
      </Container>

      {hasBeforeAfter ? (
        <Container className="pb-12 md:pb-16">
          <h2 className="mb-6 text-xl font-semibold md:text-2xl">시공 전후 비교</h2>
          <div className="mx-auto max-w-3xl">
            <BeforeAfterSlider before={project.before!} after={project.after!} alt={project.title} />
          </div>
        </Container>
      ) : null}

      {project.images.length > 0 ? (
        <Container className="pb-12 md:pb-16">
          <h2 className="mb-6 text-xl font-semibold md:text-2xl">사진</h2>
          <Gallery images={project.images} title={project.title} />
        </Container>
      ) : null}

      {testimonials.length > 0 ? (
        <Section eyebrow="REVIEWS" title="이 공간의 후기" className="border-t border-line !py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        </Section>
      ) : null}

      <section className="border-t border-line bg-surface py-16 text-center">
        <Container>
          <p className="text-xl font-medium md:text-2xl">마음에 드는 공간이 있으신가요?</p>
          <p className="mt-3 text-muted">원하시는 분위기를 알려 주시면 맞춤으로 안내해 드립니다.</p>
          <div className="mt-8">
            <Button href={`/contact?project=${encodeURIComponent(project.slug)}`}>이런 공간 상담받기</Button>
          </div>
        </Container>
      </section>

      {related.length > 0 ? (
        <Section eyebrow="MORE" title="다른 시공 사례" className="border-t border-line">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </article>
  );
}
