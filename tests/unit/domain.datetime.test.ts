import { describe, it, expect } from "vitest";
import { formatSeoulDateTime, seoulDateStamp } from "@/lib/domain/datetime";

describe("formatSeoulDateTime", () => {
  it("UTC를 서울 시각 YYYY.MM.DD HH:mm 으로", () => {
    expect(formatSeoulDateTime("2026-11-04T16:00:00Z")).toBe("2026.11.05 01:00");
    expect(formatSeoulDateTime("2026-11-04T00:05:00+00:00")).toBe("2026.11.04 09:05");
  });
  it("자정은 00시로 표기", () => {
    expect(formatSeoulDateTime("2026-11-04T15:00:00Z")).toBe("2026.11.05 00:00");
  });
  it("잘못된 값은 빈 문자열", () => {
    expect(formatSeoulDateTime("nope")).toBe("");
  });
});

describe("seoulDateStamp", () => {
  it("YYYYMMDD (서울)", () => {
    expect(seoulDateStamp(new Date("2026-11-04T16:00:00Z"))).toBe("20261105");
  });
});
