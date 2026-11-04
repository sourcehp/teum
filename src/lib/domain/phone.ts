/** 한국 전화번호를 하이픈 형식으로 정규화. 형식이 맞지 않으면 null. */
export function normalizePhone(input: string): string | null {
  let s = input.replace(/[\s.()-]/g, "");
  if (!/^\+?\d+$/.test(s)) return null;
  if (s.startsWith("+82")) s = "0" + s.slice(3);
  else if (s.startsWith("82")) s = "0" + s.slice(2);
  if (s.startsWith("+") || !s.startsWith("0")) return null;
  const n = s.length;
  if (n < 9 || n > 11) return null;

  if (s.startsWith("02")) {
    if (n === 9) return `${s.slice(0, 2)}-${s.slice(2, 5)}-${s.slice(5)}`;
    if (n === 10) return `${s.slice(0, 2)}-${s.slice(2, 6)}-${s.slice(6)}`;
    return null;
  }
  if (n === 10) return `${s.slice(0, 3)}-${s.slice(3, 6)}-${s.slice(6)}`;
  if (n === 11) return `${s.slice(0, 3)}-${s.slice(3, 7)}-${s.slice(7)}`;
  return null;
}
