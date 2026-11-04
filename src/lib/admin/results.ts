/** Supabase 는 오류를 값으로 돌려주므로, 여러 요청 결과 중 처음 나온 오류를 찾는다. */
export function firstError(results: { error: { message: string } | null }[]): { message: string } | null {
  for (const r of results) if (r.error) return r.error;
  return null;
}
