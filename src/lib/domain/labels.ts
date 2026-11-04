export const CATEGORIES = ["residential", "commercial", "office", "other"] as const;
export const BUDGET_RANGES = ["under_30m", "30m_50m", "50m_100m", "over_100m", "undisclosed"] as const;
export const INQUIRY_STATUSES = ["new", "in_progress", "done", "spam"] as const;

export type Category = (typeof CATEGORIES)[number];
export type BudgetRange = (typeof BUDGET_RANGES)[number];
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  residential: "주거",
  commercial: "상업",
  office: "오피스",
  other: "기타",
};

export const BUDGET_LABELS: Record<BudgetRange, string> = {
  under_30m: "3천만 원 미만",
  "30m_50m": "3천~5천만 원",
  "50m_100m": "5천만~1억 원",
  over_100m: "1억 원 이상",
  undisclosed: "비공개",
};

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "신규",
  in_progress: "상담중",
  done: "완료",
  spam: "스팸",
};
