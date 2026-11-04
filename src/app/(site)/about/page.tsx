import Image from "next/image";
import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { Guarantees } from "@/components/site/home/Guarantees";
import { Stats } from "@/components/site/home/Stats";
import { getPublicSettings } from "@/lib/data/public";
import { CEO_CAREER, CEO_CAREER_PROJECTS } from "@/lib/ceo-career";
import { JsonLd } from "@/components/site/JsonLd";
import { localBusinessJsonLd, siteUrl } from "@/lib/seo";
import { mediaUrl } from "@/lib/media";

export const revalidate = 3600;
export const metadata: Metadata = { title: "스튜디오 소개", alternates: { canonical: "/about" } };

const DEFAULT_PHILOSOPHY = "틈은 비어 있는 곳이 아니라 빛과 사람이 드나드는 자리입니다.";

function paragraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

export default async function AboutPage() {
  const s = await getPublicSettings();
  const philosophy = paragraphs(s.philosophy_text);
  const greeting = paragraphs(s.ceo_greeting);
  const ceoImage = mediaUrl(s.ceo_image_path);

  const rows: { label: string; value: string }[] = [{ label: "상호", value: s.company_name }];
  if (s.ceo_name) rows.push({ label: "대표자", value: s.ceo_name });
  if (s.business_number) rows.push({ label: "사업자등록번호", value: s.business_number });
  if (s.address) rows.push({ label: "주소", value: s.address });
  if (s.phone) rows.push({ label: "전화", value: s.phone });
  if (s.email) rows.push({ label: "이메일", value: s.email });

  return (
    <>
      <JsonLd data={localBusinessJsonLd(s, siteUrl())} />
      <PageHeader eyebrow="ABOUT" title="스튜디오 소개" />

      <Section eyebrow="PHILOSOPHY" title="우리가 생각하는 공간">
        <div className="max-w-3xl space-y-6 text-lg leading-loose md:text-xl">
          {(philosophy.length > 0 ? philosophy : [DEFAULT_PHILOSOPHY]).map((p) => (
            <p key={p} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      </Section>

      {greeting.length > 0 ? (
        <Section eyebrow="GREETING" title="대표 인사말" className="border-t border-line">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_320px] md:gap-16">
            <div className="max-w-2xl space-y-5 leading-loose text-muted">
              {greeting.map((p) => (
                <p key={p} className="whitespace-pre-line">{p}</p>
              ))}
              {s.ceo_name ? <p className="pt-2 font-medium text-ink">대표 {s.ceo_name}</p> : null}
            </div>
            {ceoImage ? (
              <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden bg-line md:order-last">
                <Image src={ceoImage} alt={s.ceo_name ? `${s.ceo_name} 대표` : "대표 사진"} fill sizes="(min-width: 768px) 320px, 80vw" className="object-cover" />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      <Stats stats={s.stats} />

      <Section eyebrow="CAREER" title="대표 이력" className="border-t border-line">
        <div className="max-w-3xl space-y-8">
          <div>
            <p className="font-medium">{CEO_CAREER.name} · {CEO_CAREER.title}</p>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {CEO_CAREER.history.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <ul className="mt-4 space-y-1 text-sm text-muted">
              {[...CEO_CAREER.awards, ...CEO_CAREER.certifications, ...CEO_CAREER.notes].map((n) => (
                <li key={n}>· {n}</li>
              ))}
            </ul>
          </div>

          <div className="border border-line bg-surface/50 p-5">
            <p className="text-sm leading-relaxed text-muted">
              아래는 <strong className="text-ink">틈디자인스튜디오 설립(2019년) 이전</strong>, 대표이사가 이전 소속 회사에 재직하며
              참여한 프로젝트입니다. <strong className="text-ink">틈디자인스튜디오의 시공 사례가 아니며</strong>, 대표이사의 디자인
              경력을 보여드리기 위해 정리했습니다.
            </p>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              {CEO_CAREER_PROJECTS.map((g) => (
                <div key={g.category}>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-ink">{g.category}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Guarantees guarantees={s.guarantees} />

      <Section eyebrow="COMPANY" title="회사 정보" className="border-t border-line">
        <dl className="max-w-3xl border-t border-line">
          {rows.map((r) => (
            <div key={r.label} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
              <dt className="text-sm text-muted">{r.label}</dt>
              <dd className="break-words">{r.value}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
