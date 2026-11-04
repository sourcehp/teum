import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/** GA4 측정 ID가 있을 때만 gtag를 싣는다. Vercel Analytics는 항상 켠다. */
export function Analytics({ ga4Id }: { ga4Id: string }) {
  const id = /^[A-Za-z0-9-]+$/.test(ga4Id) ? ga4Id : "";
  return (
    <>
      <VercelAnalytics />
      {id ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}');`}
          </Script>
        </>
      ) : null}
    </>
  );
}
