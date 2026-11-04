/** supabase/sample-content.sql 이 채우는 예시 값. 현재 값이 이것과 같을 때만 "예시 값입니다" 안내를 보여 준다. */
export const SAMPLE_STATS = [
  { label: "누적 시공 사례", value: "120", suffix: "건" },
  { label: "고객 만족도", value: "4.8", suffix: "/ 5" },
  { label: "평균 공사 기간", value: "7", suffix: "주" },
  { label: "하자 접수 후 방문", value: "3", suffix: "일 이내" },
];

export const SAMPLE_GUARANTEES = [
  { title: "무상 하자보수 2년", description: "준공 후 2년간 시공 하자는 무상으로 보수합니다." },
  { title: "추가 비용 없는 확정 견적", description: "계약 범위가 바뀌지 않으면 추가 비용을 청구하지 않습니다." },
  { title: "전 공정 사진 리포트", description: "공정마다 현장 사진을 정리해 보내드립니다." },
];

/** 키 순서와 숫자/문자 차이에 영향받지 않게 정해진 키만 문자열로 비교한다. */
export function sameRows(current: Record<string, unknown>[], sample: Record<string, string>[]): boolean {
  if (current.length !== sample.length) return false;
  return sample.every((s, i) => Object.keys(s).every((k) => String(current[i]?.[k] ?? "").trim() === s[k]));
}
