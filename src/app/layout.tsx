import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { getPublicSettings } from "@/lib/data/public";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, siteUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getPublicSettings();
  const google = s.google_site_verification.trim();
  const naver = s.naver_site_verification.trim();
  const verification: NonNullable<Metadata["verification"]> = {};
  if (google) verification.google = google;
  if (naver) verification.other = { "naver-site-verification": naver };
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
    ...(Object.keys(verification).length > 0 ? { verification } : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
