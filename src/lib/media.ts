/** 저장 경로를 브라우저에서 쓸 URL로 바꾼다. 외부 URL과 `/samples/...` 같은 정적 경로는 그대로 쓴다. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
