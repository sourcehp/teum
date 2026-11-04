import { BeforeAfterHighlight } from "@/components/site/home/BeforeAfterHighlight";
import { FaqPreview } from "@/components/site/home/FaqPreview";
import { FeaturedProjects } from "@/components/site/home/FeaturedProjects";
import { Guarantees } from "@/components/site/home/Guarantees";
import { Hero } from "@/components/site/home/Hero";
import { Partners } from "@/components/site/home/Partners";
import { ProcessSummary } from "@/components/site/home/ProcessSummary";
import { QuickInquiry } from "@/components/site/home/QuickInquiry";
import { Stats } from "@/components/site/home/Stats";
import { Testimonials } from "@/components/site/home/Testimonials";
import { VisualWorks } from "@/components/site/home/VisualWorks";
import {
  getBeforeAfterHighlight,
  getFaqs,
  getFeaturedProjects,
  getPublicSettings,
  getTestimonials,
} from "@/lib/data/public";
import type { Metadata } from "next";
import { JsonLd } from "@/components/site/JsonLd";
import { localBusinessJsonLd, siteUrl } from "@/lib/seo";
import { mediaUrl } from "@/lib/media";

export const revalidate = 3600;
export const metadata: Metadata = { alternates: { canonical: "/" } };

const DEFAULT_TITLE = "틈 사이로 드는 빛처럼, 머물고 싶은 공간";

export default async function HomePage() {
  const [settings, projects, highlight, testimonials, faqs] = await Promise.all([
    getPublicSettings(),
    getFeaturedProjects(6),
    getBeforeAfterHighlight(),
    getTestimonials({ featuredOnly: true }),
    getFaqs(4),
  ]);

  const heroImage = mediaUrl(settings.hero_image_path) ?? projects.find((p) => p.cover)?.cover?.url ?? null;
  const heroAlt =
    (settings.hero_image_path ? "" : projects.find((p) => p.cover)?.cover?.alt) || `${settings.company_name} 대표 시공 사진`;

  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings, siteUrl())} />
      <Hero
        title={settings.hero_title.trim() || DEFAULT_TITLE}
        subtitle={settings.hero_subtitle}
        benefit={settings.benefit_text}
        imageUrl={heroImage}
        imageAlt={heroAlt}
      />
      <Stats stats={settings.stats} />
      <FeaturedProjects projects={projects} title={settings.section_title_projects} />
      <BeforeAfterHighlight data={highlight} title={settings.section_title_before_after} />
      <VisualWorks visualWorks={settings.visual_works} title={settings.section_title_visual} />
      <Guarantees guarantees={settings.guarantees} title={settings.section_title_guarantees} />
      <Testimonials items={testimonials} title={settings.section_title_testimonials} />
      <ProcessSummary title={settings.section_title_process} steps={settings.process_steps} />
      <FaqPreview faqs={faqs} title={settings.section_title_faq} />
      <Partners partners={settings.partners} />
      <QuickInquiry phone={settings.phone} />
    </>
  );
}
