function cell(v: string | number | null): string {
  if (v === null) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [headers, ...rows].map((r) => r.map(cell).join(",") + "\r\n");
  return "\ufeff" + lines.join("");
}

/** 방문자가 입력한 텍스트가 스프레드시트에서 수식으로 실행되지 않도록 앞에 '를 붙인다. */
export function escapeCsvFormula(v: string): string {
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}
