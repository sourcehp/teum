import { describe, it, expect } from "vitest";
import { josa } from "@/lib/domain/josa";

describe("josa", () => {
  it("은/는", () => {
    expect(josa("주소", "은는")).toBe("주소는");
    expect(josa("회사명", "은는")).toBe("회사명은");
  });
  it("이/가", () => {
    expect(josa("실적", "이가")).toBe("실적이");
    expect(josa("파트너", "이가")).toBe("파트너가");
  });
  it("을/를", () => {
    expect(josa("FAQ", "을를")).toBe("FAQ를");
    expect(josa("배너", "을를")).toBe("배너를");
    expect(josa("후기", "을를")).toBe("후기를");
  });
  it("으로/로: ㄹ 받침은 로", () => {
    expect(josa("서울", "으로로")).toBe("서울로");
    expect(josa("집", "으로로")).toBe("집으로");
    expect(josa("바다", "으로로")).toBe("바다로");
  });
  it("숫자와 영문", () => {
    expect(josa("3", "은는")).toBe("3은");
    expect(josa("2", "이가")).toBe("2가");
    expect(josa("1", "으로로")).toBe("1로");
    expect(josa("Mac", "이가")).toBe("Mac가");
    expect(josa("Gmail", "은는")).toBe("Gmail은");
    expect(josa("GA4", "은는")).toBe("GA4는");
  });
  it("빈 문자열은 모음 취급", () => {
    expect(josa("", "은는")).toBe("는");
  });
});
