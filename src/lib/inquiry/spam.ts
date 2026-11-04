export const MIN_FILL_MS = 3000;

/**
 * renderedAt은 클라이언트 시계 기준이다. 누락·비정상 값은 봇으로 보고,
 * 클라이언트 시계가 앞서 diff가 음수인 경우는 정상 방문자로 허용한다.
 */
export function checkSpam(i: {
  honeypot: string;
  renderedAt: number | null;
  now: number;
}): "ok" | "honeypot" | "too_fast" {
  if (i.honeypot !== "") return "honeypot";
  if (i.renderedAt === null || !Number.isFinite(i.renderedAt) || i.renderedAt <= 0) return "too_fast";
  const diff = i.now - i.renderedAt;
  if (diff >= 0 && diff < MIN_FILL_MS) return "too_fast";
  return "ok";
}
