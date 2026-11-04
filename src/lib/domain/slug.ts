export function slugify(title: string): string {
  const s = title
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^0-9a-zÀ-ɏ가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s === "" ? "project" : s;
}

export function uniqueSlug(base: string, taken: string[]): string {
  const set = new Set(taken);
  if (!set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
