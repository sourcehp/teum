import { describe, expect, it } from "vitest";
import { captureAttribution, readAttribution } from "@/lib/attribution";

function memoryStore(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

describe("attribution", () => {
  it("첫 방문의 UTM, referrer, 랜딩 경로를 저장한다", () => {
    const s = memoryStore();
    captureAttribution(
      { href: "https://teum.kr/projects?utm_source=naver&utm_medium=cpc" },
      "https://search.naver.com/x",
      s,
    );
    expect(readAttribution(s)).toEqual({
      utm_source: "naver",
      utm_medium: "cpc",
      utm_campaign: null,
      referrer: "https://search.naver.com/x",
      landing_path: "/projects",
    });
  });

  it("두 번째 capture는 덮어쓰지 않는다", () => {
    const s = memoryStore();
    captureAttribution({ href: "https://teum.kr/?utm_source=naver" }, "", s);
    captureAttribution({ href: "https://teum.kr/about?utm_source=google" }, "https://google.com/", s);
    const a = readAttribution(s);
    expect(a.utm_source).toBe("naver");
    expect(a.landing_path).toBe("/");
  });

  it("같은 호스트 referrer는 null", () => {
    const s = memoryStore();
    captureAttribution({ href: "https://teum.kr/about" }, "https://teum.kr/projects", s);
    expect(readAttribution(s).referrer).toBeNull();
  });

  it("빈 referrer는 null, 저장된 값이 없으면 전부 null", () => {
    const s = memoryStore();
    expect(readAttribution(s)).toEqual({
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      referrer: null,
      landing_path: null,
    });
    captureAttribution({ href: "https://teum.kr/" }, "", s);
    expect(readAttribution(s).referrer).toBeNull();
  });

  it("깨진 저장 값은 빈 값으로 읽는다", () => {
    const s = memoryStore();
    s.setItem("teum_attr", "{oops");
    expect(readAttribution(s).landing_path).toBeNull();
  });
});
