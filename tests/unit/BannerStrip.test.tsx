// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BannerStrip } from "@/components/site/BannerStrip";

const banner = { id: "b1", message: "11월 한정 무료 실측", link_url: null };

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("BannerStrip", () => {
  it("문구를 표시한다", () => {
    render(<BannerStrip banner={banner} />);
    expect(screen.getByText("11월 한정 무료 실측")).toBeTruthy();
  });

  it("닫기를 누르면 사라지고 id가 저장된다", async () => {
    render(<BannerStrip banner={banner} />);
    await userEvent.click(screen.getByRole("button", { name: "배너 닫기" }));
    expect(screen.queryByText("11월 한정 무료 실측")).toBeNull();
    expect(localStorage.getItem("teum_banner_closed")).toBe("b1");
  });

  it("같은 id가 저장돼 있으면 표시하지 않는다", () => {
    localStorage.setItem("teum_banner_closed", "b1");
    render(<BannerStrip banner={banner} />);
    expect(screen.queryByText("11월 한정 무료 실측")).toBeNull();
  });

  it("다른 id의 배너는 표시한다", () => {
    localStorage.setItem("teum_banner_closed", "old");
    render(<BannerStrip banner={banner} />);
    expect(screen.getByText("11월 한정 무료 실측")).toBeTruthy();
  });
});
