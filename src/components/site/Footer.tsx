import Link from "next/link";
import type { PublicSettings } from "@/lib/data/public";
import { Container } from "./Container";
import { telHref } from "./nav";

export function Footer({ settings }: { settings: PublicSettings }) {
  const s = settings;
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (s.ceo_name) rows.push({ label: "대표자", value: s.ceo_name });
  if (s.business_number) rows.push({ label: "사업자등록번호", value: s.business_number });
  if (s.address) rows.push({ label: "주소", value: s.address });
  if (s.phone)
    rows.push({
      label: "전화",
      value: (
        <a href={telHref(s.phone)} className="hover:text-ink">
          {s.phone}
        </a>
      ),
    });
  if (s.email)
    rows.push({
      label: "이메일",
      value: (
        <a href={`mailto:${s.email}`} className="hover:text-ink">
          {s.email}
        </a>
      ),
    });

  const social = [
    { label: "인스타그램", url: s.instagram_url },
    { label: "블로그", url: s.blog_url },
    { label: "카카오톡 채널", url: s.kakao_channel_url },
  ].filter((x) => x.url);

  return (
    <footer className="border-t border-line bg-surface pb-24 md:pb-0">
      <Container className="py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:gap-16">
          <div>
            <p className="text-lg font-semibold tracking-tight">{s.company_name}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.28em] text-muted">TEUM DESIGN STUDIO</p>
            {rows.length > 0 ? (
              <dl className="mt-8 space-y-2 text-sm text-muted">
                {rows.map((r) => (
                  <div key={r.label} className="flex gap-4">
                    <dt className="w-28 shrink-0">{r.label}</dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <nav aria-label="푸터 메뉴" className="flex flex-col gap-3 text-sm">
            {social.map((x) => (
              <a key={x.label} href={x.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-ink">
                {x.label}
              </a>
            ))}
            <Link href="/privacy" className="text-muted hover:text-ink">
              개인정보처리방침
            </Link>
          </nav>
        </div>
        <p className="mt-14 border-t border-line pt-6 text-xs text-muted">
          © {new Date().getFullYear()} {s.company_name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
