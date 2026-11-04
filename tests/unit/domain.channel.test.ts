import { describe, it, expect } from "vitest";
import { classifyChannel, CHANNEL_LABELS } from "@/lib/domain/channel";

const c = (utm_source: string | null, referrer: string | null) => classifyChannel({ utm_source, referrer });

describe("classifyChannel", () => {
  it("utm_source 우선, 소문자", () => {
    expect(c("Instagram", null)).toBe("instagram");
    expect(c("Instagram", "https://www.google.com/")).toBe("instagram");
  });
  it("referrer 호스트 분류", () => {
    expect(c(null, "https://m.search.naver.com/x")).toBe("naver");
    expect(c(null, "https://blog.naver.com/a")).toBe("naver");
    expect(c(null, "https://www.google.com/search")).toBe("google");
    expect(c(null, "https://l.instagram.com/")).toBe("instagram");
    expect(c(null, "https://m.facebook.com/")).toBe("facebook");
    expect(c(null, "https://www.daum.net/")).toBe("kakao");
    expect(c(null, "https://pf.kakao.com/")).toBe("kakao");
    expect(c(null, "https://www.youtube.com/watch")).toBe("youtube");
  });
  it("접미 일치만 허용 (notnaver.com은 naver 아님)", () => {
    expect(c(null, "https://notnaver.com/")).toBe("notnaver.com");
  });
  it("그 외 호스트는 호스트명", () => {
    expect(c(null, "https://example.co.kr/")).toBe("example.co.kr");
  });
  it("없거나 잘못된 referrer는 direct", () => {
    expect(c(null, null)).toBe("direct");
    expect(c("", "")).toBe("direct");
    expect(c(null, "not a url")).toBe("direct");
  });
  it("라벨", () => {
    expect(CHANNEL_LABELS).toEqual({
      naver: "네이버", google: "구글", instagram: "인스타그램", facebook: "페이스북",
      kakao: "카카오", youtube: "유튜브", direct: "직접 방문",
    });
  });
});
