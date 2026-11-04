// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/site/ProjectCard";
import type { ProjectCard as Card } from "@/lib/data/public";

const base: Card = {
  id: "1", slug: "a", title: "성수동 아파트", category: "residential", location: "서울 성동구",
  area_pyeong: 32, budget_range: "50m_100m", summary: "요약", cover: null,
};
afterEach(cleanup);

describe("ProjectCard", () => {
  it("cover가 null이면 이미지 없이 자리표시를 렌더한다", () => {
    const { container } = render(<ProjectCard project={base} />);
    expect(screen.getByTestId("cover-placeholder")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("성수동 아파트")).toBeTruthy();
    expect(screen.getByText(/주거/)).toBeTruthy();
    expect(screen.getByText(/32평/)).toBeTruthy();
  });

  it("cover가 있으면 이미지를 렌더한다", () => {
    const { container } = render(
      <ProjectCard project={{ ...base, cover: { id: "i", url: "/samples/kitchen-mapo.webp", alt: "주방", width: 800, height: 600 } }} />,
    );
    expect(container.querySelector("img")).not.toBeNull();
    expect(screen.queryByTestId("cover-placeholder")).toBeNull();
  });
});
