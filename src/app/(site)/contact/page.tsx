import type { Metadata } from "next";
import { FaqList } from "@/components/site/FaqList";
import { PageHeader } from "@/components/site/PageHeader";
import { Container } from "@/components/site/Container";
import { InquiryFlow } from "@/components/site/inquiry/InquiryFlow";
import { telHref } from "@/components/site/nav";
import { getFaqs, getProjectBySlug, getPublicSettings } from "@/lib/data/public";

export const metadata: Metadata = { title: "상담 문의" };

function safeDecode(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ project?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.project) ? sp.project[0] : sp.project;
  // Next가 이미 한 번 디코딩한 값이므로, 퍼센트 기호가 남은 경우에만 한 번 더 시도한다.
  const slug = raw ? (raw.includes("%") ? (safeDecode(raw) ?? raw) : raw) : null;
  const [settings, faqs, project] = await Promise.all([
    getPublicSettings(),
    getFaqs(4),
    slug ? getProjectBySlug(slug) : Promise.resolve(null),
  ]);

  const s = settings;
  const link = "border-b border-ink pb-0.5 hover:text-accent-ink";

  return (
    <>
      <PageHeader eyebrow="CONTACT" title="상담 문의" />
      <Container className="grid gap-16 py-14 md:py-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-20">
        <div className="max-w-xl">
          <InquiryFlow variant="full" initialMessage={project ? `관심 사례: ${project.title}` : undefined} />
        </div>

        <aside className="space-y-12">
          {s.phone || s.kakao_channel_url || s.address ? (
            <div>
              <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.24em] text-accent-ink">CONTACT INFO</h2>
              <ul className="space-y-4">
                {s.phone ? (
                  <li>
                    <p className="text-sm text-muted">전화</p>
                    <a href={telHref(s.phone)} className={`text-lg ${link}`}>{s.phone}</a>
                  </li>
                ) : null}
                {s.kakao_channel_url ? (
                  <li>
                    <p className="text-sm text-muted">카카오톡</p>
                    <a href={s.kakao_channel_url} target="_blank" rel="noopener noreferrer" className={link}>카카오톡 채널로 문의하기</a>
                  </li>
                ) : null}
                {s.address ? (
                  <li>
                    <p className="text-sm text-muted">주소</p>
                    <p className="break-words">{s.address}</p>
                    <a
                      href={`https://map.naver.com/p/search/${encodeURIComponent(s.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-1 inline-block text-sm ${link}`}
                    >
                      네이버 지도에서 보기
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {faqs.length > 0 ? (
            <div>
              <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.24em] text-accent-ink">FAQ</h2>
              <FaqList faqs={faqs} />
            </div>
          ) : null}
        </aside>
      </Container>
    </>
  );
}
