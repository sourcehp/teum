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
  it("missing or invalid renderedAt is too_fast", () => {
    expect(checkSpam({ honeypot: "", renderedAt: null, now: 10_000 })).toBe("too_fast");
    expect(checkSpam({ honeypot: "", renderedAt: NaN, now: 10_000 })).toBe("too_fast");
    expect(checkSpam({ honeypot: "", renderedAt: 0, now: 10_000 })).toBe("too_fast");
    expect(checkSpam({ honeypot: "", renderedAt: -5, now: 10_000 })).toBe("too_fast");
  });
  it("client clock ahead (future renderedAt) is ok", () => {
    expect(checkSpam({ honeypot: "", renderedAt: 70_000, now: 10_000 })).toBe("ok");
  });
});
