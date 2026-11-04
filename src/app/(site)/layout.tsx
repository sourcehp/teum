import { Analytics } from "@/components/site/Analytics";
import { AttributionCapture } from "@/components/site/AttributionCapture";
import { BannerStrip } from "@/components/site/BannerStrip";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { KakaoFloat } from "@/components/site/KakaoFloat";
import { MobileActionBar } from "@/components/site/MobileActionBar";
import { getActiveBanner, getPublicSettings } from "@/lib/data/public";
import { mediaUrl } from "@/lib/media";

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, banner] = await Promise.all([getPublicSettings(), getActiveBanner()]);
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
      >
        본문 바로가기
      </a>
      {banner ? <BannerStrip banner={{ id: banner.id, message: banner.message, link_url: banner.link_url }} /> : null}
      <Header companyName={settings.company_name} logoUrl={mediaUrl(settings.logo_path)} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <MobileActionBar phone={settings.phone} kakaoUrl={settings.kakao_channel_url} />
      <KakaoFloat url={settings.kakao_channel_url} />
      <AttributionCapture />
      <Analytics ga4Id={settings.ga4_id} />
    </>
  );
}
