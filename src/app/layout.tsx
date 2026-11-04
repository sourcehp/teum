import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { Analytics } from "@/components/site/Analytics";
import { getPublicSettings } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "틈디자인스튜디오",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        {children}
        <Analytics ga4Id={settings.ga4_id} />
      </body>
    </html>
  );
}
