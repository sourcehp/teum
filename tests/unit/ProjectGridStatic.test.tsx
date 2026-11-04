// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ProjectGridStatic } from "@/components/site/projects/ProjectGridStatic";
import type { ProjectCard as Card } from "@/lib/data/public";

const mk = (i: number): Card => ({
  id: String(i), slug: `p${i}`, title: `사례${i}`, category: "residential", location: "서울",
  area_pyeong: 30, budget_range: "50m_100m", summary: "", cover: null,
});
afterEach(cleanup);

describe("ProjectGridStatic", () => {
  it("필터 그룹과 모든 카드를 렌더한다", () => {
    const { container } = render(<ProjectGridStatic projects={[mk(1), mk(2), mk(3)]} />);
    for (const l of ["공간 유형", "평형", "예산"]) expect(screen.getByRole("group", { name: l })).toBeTruthy();
    expect(container.querySelectorAll('a[href^="/projects/"]').length).toBe(3);
    expect(screen.getByText("3개의 사례")).toBeTruthy();
    expect(container.querySelectorAll("button:not([disabled])").length).toBe(0);
  });
});
