export type PyeongBucket = "lt20" | "20to30" | "30to40" | "gte40";

export const PYEONG_LABELS: Record<PyeongBucket, string> = {
  lt20: "20평 미만",
  "20to30": "20~30평",
  "30to40": "30~40평",
  gte40: "40평 이상",
};

export function pyeongBucket(area: number | null): PyeongBucket | null {
  if (area === null || Number.isNaN(area)) return null;
  if (area < 20) return "lt20";
  if (area < 30) return "20to30";
  if (area < 40) return "30to40";
  return "gte40";
}
