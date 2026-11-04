// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CountUp } from "@/components/site/CountUp";

afterEach(cleanup);

describe("CountUp", () => {
  it("최종값을 sr-only 텍스트로 노출하고 aria-label을 쓰지 않는다", () => {
    const { container } = render(<CountUp value="120" />);
    const sr = screen.getByText("120", { selector: ".sr-only" });
    expect(sr.getAttribute("aria-hidden")).toBeNull();
    expect(container.querySelector("[aria-label]")).toBeNull();
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("숫자가 아닌 값도 그대로 보여준다", () => {
    render(<CountUp value="상시" />);
    expect(screen.getAllByText("상시").length).toBe(2);
  });
});
