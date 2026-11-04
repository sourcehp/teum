import { describe, it, expect } from "vitest";
import {
  CATEGORIES, BUDGET_RANGES, INQUIRY_STATUSES,
  CATEGORY_LABELS, BUDGET_LABELS, STATUS_LABELS,
} from "@/lib/domain/labels";

describe("labels", () => {
  it("값이 DB check 제약과 일치한다", () => {
    expect([...CATEGORIES]).toEqual(["residential", "commercial", "office", "other"]);
    expect([...BUDGET_RANGES]).toEqual(["under_30m", "30m_50m", "50m_100m", "over_100m", "undisclosed"]);
    expect([...INQUIRY_STATUSES]).toEqual(["new", "in_progress", "done", "spam"]);
  });
  it("모든 값에 한국어 라벨이 있다", () => {
    expect(CATEGORY_LABELS).toEqual({ residential: "주거", commercial: "상업", office: "오피스", other: "기타" });
    expect(BUDGET_LABELS).toEqual({
      under_30m: "3천만 원 미만", "30m_50m": "3천~5천만 원", "50m_100m": "5천만~1억 원",
      over_100m: "1억 원 이상", undisclosed: "비공개",
    });
    expect(STATUS_LABELS).toEqual({ new: "신규", in_progress: "상담중", done: "완료", spam: "스팸" });
  });
});
