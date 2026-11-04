import { afterEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

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
  it("returns sent / failed from Resend result", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    send.mockResolvedValueOnce({ data: { id: "1" }, error: null });
    expect(await notifyNewInquiry(inquiry, "a@b.co")).toBe("sent");
    expect(send.mock.calls.at(-1)![0].text).toContain("오전 9:00"); // 00:00Z = 서울 09:00
    send.mockResolvedValueOnce({ data: null, error: { message: "x" } });
    expect(await notifyNewInquiry(inquiry, "a@b.co")).toBe("failed");
    send.mockRejectedValueOnce(new Error("boom"));
    expect(await notifyNewInquiry(inquiry, "a@b.co")).toBe("failed");
  });
  it("times out to failed when Resend hangs", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    send.mockReturnValueOnce(new Promise(() => {}));
    expect(await notifyNewInquiry(inquiry, "a@b.co", 20)).toBe("failed");
  });
});
