import { describe, expect, it } from "vitest";
import { checkSpam } from "@/lib/inquiry/spam";

describe("checkSpam", () => {
  it("flags honeypot", () => {
    expect(checkSpam({ honeypot: "http://x", renderedAt: 0, now: 10_000 })).toBe("honeypot");
  });
  it("flags too fast at 2999ms", () => {
    expect(checkSpam({ honeypot: "", renderedAt: 1000, now: 3999 })).toBe("too_fast");
  });
  it("ok at 3000ms", () => {
    expect(checkSpam({ honeypot: "", renderedAt: 1000, now: 4000 })).toBe("ok");
  });
});
