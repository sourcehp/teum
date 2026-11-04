export const MIN_FILL_MS = 3000;

export function checkSpam(i: { honeypot: string; renderedAt: number; now: number }): "ok" | "honeypot" | "too_fast" {
  if (i.honeypot !== "") return "honeypot";
  if (i.now - i.renderedAt < MIN_FILL_MS) return "too_fast";
  return "ok";
}
