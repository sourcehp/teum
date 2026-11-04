import { describe, expect, it } from "vitest";
import { step1Schema, step2Schema } from "@/lib/inquiry/schema";

const ok = { name: "홍길동", phone: "010 1234 5678", space_type: "residential", privacy: "on" };

describe("step1Schema", () => {
  it("accepts valid input and normalizes the phone", () => {
    const r = step1Schema.safeParse(ok);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("010-1234-5678");
  });
  it("trims the name", () => {
    const r = step1Schema.safeParse({ ...ok, name: "  홍길동  " });
    expect(r.success && r.data.name).toBe("홍길동");
  });
  it("rejects empty and 31-char names", () => {
    expect(step1Schema.safeParse({ ...ok, name: "" }).success).toBe(false);
    expect(step1Schema.safeParse({ ...ok, name: "가".repeat(31) }).success).toBe(false);
    expect(step1Schema.safeParse({ ...ok, name: "가".repeat(30) }).success).toBe(true);
  });
  it("rejects bad phone with message", () => {
    const r = step1Schema.safeParse({ ...ok, phone: "abc" });
    expect(!r.success && r.error.issues[0].message).toBe("연락처 형식을 확인해 주세요");
  });
  it("rejects unknown space_type", () => {
    expect(step1Schema.safeParse({ ...ok, space_type: "x" }).success).toBe(false);
  });
  it("requires privacy consent with message", () => {
    const { privacy: _p, ...rest } = ok;
    const r = step1Schema.safeParse(rest);
    expect(!r.success && r.error.issues.map((i) => i.message)).toContain("개인정보 수집·이용에 동의해 주세요");
    expect(step1Schema.safeParse({ ...ok, privacy: "off" }).success).toBe(false);
  });
});

describe("step2Schema", () => {
  it("treats empty strings as undefined", () => {
    const r = step2Schema.safeParse({ email: "", region: "", area_pyeong: "", budget_range: "", desired_start: "", message: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(Object.values(r.data).every((v) => v === undefined)).toBe(true);
  });
  it("parses valid values", () => {
    const r = step2Schema.safeParse({ email: "a@b.co", area_pyeong: "32", budget_range: "50m_100m", region: "서울" });
    expect(r.success && r.data.area_pyeong).toBe(32);
  });
  it("rejects invalid email, area, budget", () => {
    expect(step2Schema.safeParse({ email: "nope" }).success).toBe(false);
    expect(step2Schema.safeParse({ area_pyeong: "0" }).success).toBe(false);
    expect(step2Schema.safeParse({ area_pyeong: "10001" }).success).toBe(false);
    expect(step2Schema.safeParse({ budget_range: "zzz" }).success).toBe(false);
  });
  it("limits message to 2000 chars", () => {
    expect(step2Schema.safeParse({ message: "a".repeat(2000) }).success).toBe(true);
    expect(step2Schema.safeParse({ message: "a".repeat(2001) }).success).toBe(false);
  });
});
