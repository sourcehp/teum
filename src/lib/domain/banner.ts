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
