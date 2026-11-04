import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/domain/labels";

export const INQUIRY_PAGE_SIZE = 20;

export function parseStatus(v: string | string[] | undefined): InquiryStatus | null {
  const s = Array.isArray(v) ? v[0] : v;
  return (INQUIRY_STATUSES as readonly string[]).includes(s ?? "") ? (s as InquiryStatus) : null;
}

export function parsePage(v: string | string[] | undefined): number {
  const s = Array.isArray(v) ? v[0] : v;
  const n = Number(s);
  return Number.isInteger(n) && n >= 1 && n <= 100000 ? n : 1;
}
