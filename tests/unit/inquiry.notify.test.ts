import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyNewInquiry } from "@/lib/inquiry/notify";

const inquiry = { id: "abc", name: "홍길동", phone: "010-1234-5678", space_type: "residential" as const, created_at: "2026-11-04T00:00:00Z" };

afterEach(() => vi.unstubAllEnvs());

describe("notifyNewInquiry", () => {
  it("skips without API key", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(await notifyNewInquiry(inquiry, "a@b.co")).toBe("skipped");
  });
  it("skips with empty or null recipient", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    expect(await notifyNewInquiry(inquiry, "")).toBe("skipped");
    expect(await notifyNewInquiry(inquiry, null)).toBe("skipped");
  });
});
