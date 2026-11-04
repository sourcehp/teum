export const NAV_ITEMS = [
  { href: "/projects", label: "시공 사례" },
  { href: "/about", label: "스튜디오" },
  { href: "/process", label: "진행 절차" },
  { href: "/contact", label: "상담 문의" },
] as const;

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
