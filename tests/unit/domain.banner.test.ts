import { describe, it, expect } from "vitest";
import { todayInSeoul, isBannerVisible, pickBanner } from "@/lib/domain/banner";

const b = { is_active: true, starts_on: "2026-11-05", ends_on: "2026-11-30" };

describe("banner", () => {
  it("todayInSeoul은 서울 날짜를 반환한다", () => {
    expect(todayInSeoul(new Date("2026-11-04T16:00:00Z"))).toBe("2026-11-05");
    expect(todayInSeoul(new Date("2026-11-04T14:59:59Z"))).toBe("2026-11-04");
  });
  it("서울 자정 직후 UTC 16:00에 시작일 배너가 보인다", () => {
    expect(isBannerVisible(b, new Date("2026-11-04T16:00:00Z"))).toBe(true);
  });
  it("시작 전(서울 11/4 23:59:59)에는 안 보인다", () => {
    expect(isBannerVisible(b, new Date("2026-11-04T14:59:59Z"))).toBe(false);
  });
  it("종료일 당일 23:59 KST까지 보이고 다음 날은 아니다", () => {
    expect(isBannerVisible(b, new Date("2026-11-30T14:59:00Z"))).toBe(true);
    expect(isBannerVisible(b, new Date("2026-11-30T15:00:00Z"))).toBe(false);
  });
  it("비활성이면 안 보인다", () => {
    expect(isBannerVisible({ ...b, is_active: false }, new Date("2026-11-10T00:00:00Z"))).toBe(false);
  });
  it("pickBanner: 겹치면 늦게 시작한 것, 없으면 null", () => {
    const a = { id: "a", ...b, starts_on: "2026-11-01" };
    const c = { id: "c", ...b, starts_on: "2026-11-08" };
    const now = new Date("2026-11-10T00:00:00Z");
    expect(pickBanner([a, c], now)?.id).toBe("c");
    expect(pickBanner([c, a], now)?.id).toBe("c");
    expect(pickBanner([a, c], new Date("2026-10-01T00:00:00Z"))).toBeNull();
    expect(pickBanner([], now)).toBeNull();
  });
});
