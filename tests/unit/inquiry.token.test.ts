import { describe, expect, it } from "vitest";
import { createDetailToken, hashIp, hashToken } from "@/lib/inquiry/token";

describe("token", () => {
  it("hash matches hashToken(token)", () => {
    const t = createDetailToken();
    expect(hashToken(t.token)).toBe(t.hash);
    expect(t.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(t.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it("tokens differ", () => {
    expect(createDetailToken().token).not.toBe(createDetailToken().token);
  });
  it("hashIp is 64 hex", () => {
    expect(hashIp("1.1.1.1", "s")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashIp("1.1.1.1", "s")).not.toBe(hashIp("1.1.1.2", "s"));
  });
});
