import { describe, expect, it } from "vitest";
import { bannerSchema, faqSchema, projectSchema, testimonialSchema } from "@/lib/admin/schemas";

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

describe("testimonialSchema", () => {
  const t = { customer_label: "성수동 김OO님", space_label: "32평 아파트", rating: "5", body: "좋았어요" };
  it("정상 입력과 연결 안 함", () => {
    const r = testimonialSchema.safeParse({ ...t, project_id: "" });
    expect(r.success && r.data.project_id).toBe(null);
    expect(r.success && r.data.rating).toBe(5);
  });
  it("별점 범위, 사례 id, 길이 검사", () => {
    expect(testimonialSchema.safeParse({ ...t, rating: "0" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...t, rating: "6" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...t, rating: "3.5" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...t, rating: "" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...t, project_id: "abc" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...t, customer_label: "가".repeat(31) }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...t, body: "가".repeat(1001) }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...t, body: " " }).success).toBe(false);
  });
});

describe("faqSchema", () => {
  it("질문 1~200, 답변 1~2000", () => {
    expect(faqSchema.safeParse({ question: "q", answer: "a" }).success).toBe(true);
    expect(faqSchema.safeParse({ question: "", answer: "a" }).success).toBe(false);
    expect(faqSchema.safeParse({ question: "가".repeat(201), answer: "a" }).success).toBe(false);
    expect(faqSchema.safeParse({ question: "q", answer: "가".repeat(2001) }).success).toBe(false);
  });
});

describe("bannerSchema", () => {
  const b = { message: "이벤트", link_url: "", starts_on: "2026-11-01", ends_on: "2026-11-30", is_active: "on" };
  it("정상 입력", () => {
    const r = bannerSchema.safeParse(b);
    expect(r.success && r.data.link_url).toBe(null);
    expect(r.success && r.data.is_active).toBe(true);
  });
  it("종료일이 시작일보다 빠르면 실패", () => {
    const r = bannerSchema.safeParse({ ...b, ends_on: "2026-10-31" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("종료일은 시작일 이후여야 합니다");
    expect(bannerSchema.safeParse({ ...b, ends_on: "2026-11-01" }).success).toBe(true);
  });
  it("link_url: 내부 경로와 https 만 허용", () => {
    for (const ok of ["/contact", "/projects?x=1", "https://example.com/a"])
      expect(bannerSchema.safeParse({ ...b, link_url: ok }).success).toBe(true);
    for (const bad of ["javascript:alert(1)", "//evil.com", "/\\evil.com", "http://example.com", "data:text/html,x", "example.com", "https://", " javascript:alert(1)"])
      expect(bannerSchema.safeParse({ ...b, link_url: bad }).success).toBe(false);
  });
  it("메시지 1~80, 날짜 필수", () => {
    expect(bannerSchema.safeParse({ ...b, message: "가".repeat(81) }).success).toBe(false);
    expect(bannerSchema.safeParse({ ...b, message: "" }).success).toBe(false);
    expect(bannerSchema.safeParse({ ...b, starts_on: "" }).success).toBe(false);
  });
});
