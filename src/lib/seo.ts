import type { ProjectDetail, PublicSettings } from "@/lib/data/public";
import { mediaUrl } from "@/lib/media";

export const SITE_NAME = "틈디자인스튜디오";
export const DEFAULT_TITLE = `${SITE_NAME} | 공간 인테리어 설계·시공`;
export const DEFAULT_DESCRIPTION =
  "주거·상업·오피스 공간을 상담부터 설계, 시공, 사후관리까지 책임지는 인테리어 설계·시공 스튜디오, 틈디자인스튜디오입니다.";

export function siteUrl(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const raw = process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : "") || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function pageTitle(t?: string): string {
  const title = t?.trim();
  return title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
}

export function absoluteUrl(path: string, base: string = siteUrl()): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** JSON-LD 본문. `<`를 이스케이프해 관리자 입력이 script 태그를 닫지 못하게 한다. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}


export function localBusinessJsonLd(s: PublicSettings, base: string): object {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: s.company_name,
    url: base,
  };
  const image = mediaUrl(s.hero_image_path) ?? mediaUrl(s.logo_path);
  if (image) ld.image = absoluteUrl(image, base);
  if (s.phone.trim()) ld.telephone = s.phone.trim();
  if (s.address.trim()) {
    ld.address = { "@type": "PostalAddress", streetAddress: s.address.trim(), addressCountry: "KR" };
  }
  const sameAs = [s.instagram_url, s.blog_url].map((u) => u.trim()).filter(Boolean);
  if (sameAs.length > 0) ld.sameAs = sameAs;
  return ld;
}

export function projectJsonLd(p: ProjectDetail, base: string): object {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.seo_title?.trim() || p.title,
    url: absoluteUrl(`/projects/${encodeURIComponent(p.slug)}`, base),
  };
  if (p.cover) ld.image = absoluteUrl(p.cover.url, base);
  const description = p.seo_description?.trim() || p.summary.trim();
  if (description) ld.description = description;
  if (p.location.trim()) ld.locationCreated = { "@type": "Place", name: p.location.trim() };
  return ld;
}
