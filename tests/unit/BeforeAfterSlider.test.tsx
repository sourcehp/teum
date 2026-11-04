// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";

const img = (n: string) => ({ id: n, url: `/samples/${n}.webp`, alt: n, width: 800, height: 600 });
afterEach(cleanup);

describe("BeforeAfterSlider", () => {
  it("초기값은 50이다", () => {
    render(<BeforeAfterSlider before={img("living-before")} after={img("living-after")} alt="거실" />);
    const s = screen.getByRole("slider");
    expect(s.getAttribute("aria-valuenow")).toBe("50");
    expect(s.getAttribute("aria-valuemin")).toBe("0");
    expect(s.getAttribute("aria-valuemax")).toBe("100");
  });

  it("방향키로 5씩 움직인다", async () => {
    render(<BeforeAfterSlider before={img("living-before")} after={img("living-after")} alt="거실" />);
    const s = screen.getByRole("slider");
    s.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(s.getAttribute("aria-valuenow")).toBe("55");
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(s.getAttribute("aria-valuenow")).toBe("45");
  });
});
