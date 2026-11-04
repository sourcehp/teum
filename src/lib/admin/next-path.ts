/** 로그인 후 이동할 경로를 /admin 아래로만 제한한다(오픈 리다이렉트 방지). */
export function safeNextPath(raw: unknown): string {
  if (typeof raw !== "string") return "/admin";
  if (raw.startsWith("//") || raw.includes("\\") || raw.includes("://")) return "/admin";
  if (raw === "/admin" || raw.startsWith("/admin/") || raw.startsWith("/admin?")) {
    if (raw.startsWith("/admin//")) return "/admin";
    return raw;
  }
  return "/admin";
}
