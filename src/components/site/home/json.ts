/** 설정의 JSON 컬럼을 방어적으로 읽는다. 형식이 어긋난 항목은 버린다. */
export function asRecords(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x)) : [];
}
export const text = (v: unknown): string => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
