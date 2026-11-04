import { describe, expect, it } from "vitest";
import { projectSchema } from "@/lib/admin/schemas";

const base = { title: "성수동 32평", category: "residential" };

describe("projectSchema", () => {
  it("체크박스를 보내지 않으면 false", () => {
    const r = projectSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.is_published).toBe(false);
      expect(r.data.is_featured).toBe(false);
      expect(r.data.is_sample).toBe(false);
    }
  });

  it("체크박스 on 은 true", () => {
    const r = projectSchema.safeParse({ ...base, is_published: "on" });
    expect(r.success && r.data.is_published).toBe(true);
  });

  it("빈 slug 는 허용되고 빈 값으로 정리된다", () => {
    const r = projectSchema.safeParse({ ...base, slug: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.slug).toBe("");
  });

  it("duration_weeks 'abc' 는 실패", () => {
    const r = projectSchema.safeParse({ ...base, duration_weeks: "abc" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe("duration_weeks");
  });

  it("duration_weeks 빈 값은 null, 숫자는 정수", () => {
    const empty = projectSchema.safeParse({ ...base, duration_weeks: "" });
    expect(empty.success && empty.data.duration_weeks).toBe(null);
    const ok = projectSchema.safeParse({ ...base, duration_weeks: "8" });
    expect(ok.success && ok.data.duration_weeks).toBe(8);
    expect(projectSchema.safeParse({ ...base, duration_weeks: "521" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, duration_weeks: "1.5" }).success).toBe(false);
  });

  it("seo_description 161자는 실패, 160자는 통과", () => {
    expect(projectSchema.safeParse({ ...base, seo_description: "가".repeat(161) }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, seo_description: "가".repeat(160) }).success).toBe(true);
  });

  it("제목은 1~100자, 카테고리와 예산은 열거값", () => {
    expect(projectSchema.safeParse({ ...base, title: "" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, title: "가".repeat(101) }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, category: "x" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, budget_range: "x" }).success).toBe(false);
  });

  it("평수는 선택, 양수만", () => {
    const empty = projectSchema.safeParse({ ...base, area_pyeong: "" });
    expect(empty.success && empty.data.area_pyeong).toBe(null);
    const ok = projectSchema.safeParse({ ...base, area_pyeong: "32.5" });
    expect(ok.success && ok.data.area_pyeong).toBe(32.5);
    expect(projectSchema.safeParse({ ...base, area_pyeong: "0" }).success).toBe(false);
    expect(projectSchema.safeParse({ ...base, area_pyeong: "x" }).success).toBe(false);
  });

  it("완료일은 날짜 형식만", () => {
    const ok = projectSchema.safeParse({ ...base, completed_on: "2026-10-01" });
    expect(ok.success && ok.data.completed_on).toBe("2026-10-01");
    expect(projectSchema.safeParse({ ...base, completed_on: "2026-13-40" }).success).toBe(false);
    const empty = projectSchema.safeParse({ ...base, completed_on: "" });
    expect(empty.success && empty.data.completed_on).toBe(null);
  });
});
