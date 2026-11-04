const PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function seoulParts(d: Date): Record<string, string> {
  return Object.fromEntries(PARTS.formatToParts(d).map((p) => [p.type, p.value]));
}

/** ISO 시각을 서울 기준 `YYYY.MM.DD HH:mm`으로. 잘못된 값은 빈 문자열. */
export function formatSeoulDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = seoulParts(d);
  return `${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute}`;
}

/** 서울 기준 날짜 `YYYYMMDD` (파일명용). */
export function seoulDateStamp(d: Date): string {
  const p = seoulParts(d);
  return `${p.year}${p.month}${p.day}`;
}
