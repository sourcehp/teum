import { describe, expect, it } from "vitest";
import { filterProjects, filterToQuery, parseProjectFilter } from "@/lib/project-filters";
import type { ProjectCard } from "@/lib/data/public";

const mk = (o: Partial<ProjectCard>): ProjectCard => ({
  id: "x", slug: "x", title: "t", category: "residential", location: "", area_pyeong: 32,
  budget_range: "50m_100m", summary: "", cover: null, ...o,
});

describe("parseProjectFilter", () => {
  it("허용 값 외는 무시한다", () => {
    expect(parseProjectFilter(new URLSearchParams("category=office&pyeong=bad"))).toEqual({ category: "office" });
    expect(parseProjectFilter(new URLSearchParams("budget=over_100m&category=zzz"))).toEqual({ budget: "over_100m" });
    expect(parseProjectFilter(new URLSearchParams(""))).toEqual({});
  });
});

describe("filterProjects", () => {
  const list = [
    mk({ id: "1", category: "residential", area_pyeong: 25, budget_range: "30m_50m" }),
    mk({ id: "2", category: "residential", area_pyeong: 45, budget_range: "over_100m" }),
    mk({ id: "3", category: "office", area_pyeong: 25, budget_range: "30m_50m" }),
    mk({ id: "4", category: "residential", area_pyeong: null, budget_range: "undisclosed" }),
  ];
  it("빈 필터는 전체를 돌려준다", () => {
    expect(filterProjects(list, {})).toHaveLength(4);
  });
  it("category, pyeong, budget 교집합으로 거른다", () => {
    expect(filterProjects(list, { category: "residential" }).map((p) => p.id)).toEqual(["1", "2", "4"]);
    expect(filterProjects(list, { category: "residential", pyeong: "20to30" }).map((p) => p.id)).toEqual(["1"]);
    expect(filterProjects(list, { pyeong: "20to30", budget: "30m_50m" }).map((p) => p.id)).toEqual(["1", "3"]);
    expect(filterProjects(list, { category: "office", budget: "over_100m" })).toEqual([]);
  });
  it("평수 미상 사례는 평형 필터에서 제외된다", () => {
    expect(filterProjects(list, { pyeong: "gte40" }).map((p) => p.id)).toEqual(["2"]);
  });
});

describe("filterToQuery", () => {
  it("값이 있는 키만 순서대로 직렬화한다", () => {
    expect(filterToQuery({ category: "residential", pyeong: "20to30" })).toBe("category=residential&pyeong=20to30");
    expect(filterToQuery({})).toBe("");
    expect(filterToQuery({ budget: "under_30m", category: "other" })).toBe("category=other&budget=under_30m");
  });
});
