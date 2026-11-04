import { describe, expect, it } from "vitest";
import { validateNewPassword } from "@/lib/admin/password";

describe("validateNewPassword", () => {
  it("10자 미만은 거부", () => {
    expect(validateNewPassword("short", "short")).toContain("10자 이상");
  });
  it("확인 값이 다르면 거부", () => {
    expect(validateNewPassword("abcdefghij1", "abcdefghij2")).toContain("일치하지 않습니다");
  });
  it("10자 이상이고 일치하면 통과", () => {
    expect(validateNewPassword("abcdefghij", "abcdefghij")).toBeNull();
  });
});
