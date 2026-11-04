export type AnalyticsEvent = "generate_lead" | "inquiry_detail" | "click_call" | "click_kakao";

type Gtag = (command: "event", name: string, params?: Record<string, string>) => void;

/** GA4가 로드돼 있을 때만 이벤트를 보낸다. 없으면 무시한다. */
export function track(event: AnalyticsEvent, params?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", event, params);
  } catch {
    // 분석 오류가 화면을 막지 않게 한다.
  }
}
