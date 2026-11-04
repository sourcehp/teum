import { describe, it, expect } from "vitest";
import { pyeongBucket, PYEONG_LABELS } from "@/lib/domain/pyeong";

describe("pyeongBucket", () => {
  it("경계값", () => {
    expect(pyeongBucket(19.9)).toBe("lt20");
    expect(pyeongBucket(20)).toBe("20to30");
    expect(pyeongBucket(29.9)).toBe("20to30");
    expect(pyeongBucket(30)).toBe("30to40");
    expect(pyeongBucket(40)).toBe("gte40");
    expect(pyeongBucket(null)).toBeNull();
  });
  it("라벨", () => {
    expect(PYEONG_LABELS).toEqual({ lt20: "20평 미만", "20to30": "20~30평", "30to40": "30~40평", gte40: "40평 이상" });
  });
});
