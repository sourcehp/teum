const seoulDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 서울 기준 오늘 날짜 'YYYY-MM-DD' */
export function todayInSeoul(now: Date): string {
  const parts = seoulDate.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export type BannerLike = { is_active: boolean; starts_on: string; ends_on: string };

/** 시작일·종료일 모두 포함(서울 기준 날짜 비교) */
export function isBannerVisible(b: BannerLike, now: Date): boolean {
  if (!b.is_active) return false;
  const today = todayInSeoul(now);
  return b.starts_on <= today && today <= b.ends_on;
}

/** 보이는 배너 중 starts_on이 가장 늦은 것 */
export function pickBanner<T extends BannerLike>(list: T[], now: Date): T | null {
  let best: T | null = null;
  for (const b of list) {
    if (!isBannerVisible(b, now)) continue;
    if (best === null || b.starts_on > best.starts_on) best = b;
  }
  return best;
}

export type BannerStatus = "노출 중" | "예약" | "종료" | "꺼짐";

/** 관리자 목록용 상태. 꺼짐 → 예약 → 종료 → 노출 중 순으로 판정(서울 기준 날짜). */
export function bannerStatus(b: BannerLike, now: Date): BannerStatus {
  if (!b.is_active) return "꺼짐";
  const today = todayInSeoul(now);
  if (today < b.starts_on) return "예약";
  if (today > b.ends_on) return "종료";
  return "노출 중";
}
