function cell(v: string | number | null): string {
  if (v === null) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const lines = [headers, ...rows].map((r) => r.map(cell).join(",") + "\r\n");
  return "﻿" + lines.join("");
}
