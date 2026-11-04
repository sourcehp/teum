import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/data/public";
import { absoluteUrl, jsonLdScript, localBusinessJsonLd, pageTitle, projectJsonLd } from "@/lib/seo";

const SITE = "https://teum.example";
const base = { ...DEFAULT_SETTINGS, company_name: "(주)틈디자인스튜디오" };

describe("pageTitle", () => {
  it("템플릿을 적용한다", () => {
    expect(pageTitle("시공 사례")).toBe("시공 사례 | 틈디자인스튜디오");
  });
  it("값이 없으면 기본 제목", () => {
    expect(pageTitle()).toBe("틈디자인스튜디오 | 공간 인테리어 설계·시공");
  });
});

describe("localBusinessJsonLd", () => {
  it("빈 전화·주소·sameAs는 생략한다", () => {
    const ld = localBusinessJsonLd({ ...base, phone: "", address: "", instagram_url: "", blog_url: "" }, SITE) as Record<string, unknown>;
    expect(ld["@type"]).toBe("HomeAndConstructionBusiness");
    expect(ld.name).toBe("(주)틈디자인스튜디오");
    expect(ld.url).toBe(SITE);
    expect("telephone" in ld).toBe(false);
    expect("address" in ld).toBe(false);
    expect("sameAs" in ld).toBe(false);
  });
  it("값이 있는 것만 담는다", () => {
    const ld = localBusinessJsonLd(
      { ...base, phone: "02-1234-5678", address: "서울 성동구 1", instagram_url: "https://instagram.com/teum", blog_url: "" },
      SITE,
    ) as Record<string, any>;
    expect(ld.telephone).toBe("02-1234-5678");
    expect(ld.address.streetAddress).toBe("서울 성동구 1");
    expect(ld.sameAs).toEqual(["https://instagram.com/teum"]);
  });
});

describe("projectJsonLd", () => {
  it("CreativeWork, 이미지는 절대 URL", () => {
    const ld = projectJsonLd(
      {
        id: "1", slug: "a", title: "성수동 주택", category: "residential", location: "서울 성동구", area_pyeong: 30,
        budget_range: "under_30m", summary: "요약", cover: { id: "i", url: "/samples/a.webp", alt: "", width: 1, height: 1 },
        duration_weeks: null, completed_on: null, body: "", images: [], before: null, after: null, seo_title: null, seo_description: null,
      } as never,
      SITE,
    ) as Record<string, any>;
    expect(ld["@type"]).toBe("CreativeWork");
    expect(ld.image).toBe("https://teum.example/samples/a.webp");
    expect(ld.locationCreated.name).toBe("서울 성동구");
  });
});

describe("helpers", () => {
  it("absoluteUrl", () => {
    expect(absoluteUrl("/a", SITE)).toBe("https://teum.example/a");
    expect(absoluteUrl("https://x.com/a.png", SITE)).toBe("https://x.com/a.png");
  });
  it("jsonLdScript는 < 를 이스케이프한다", () => {
    const s = jsonLdScript({ name: "</script><b>" });
    expect(s).not.toContain("<");
    expect(JSON.parse(s).name).toBe("</script><b>");
  });
});
