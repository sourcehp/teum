import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  getActiveBanner,
  getBeforeAfterHighlight,
  getFaqs,
  getFeaturedProjects,
  getProjectBySlug,
  getPublicSettings,
  getRelatedProjects,
  getTestimonials,
  listPublishedProjects,
} from "@/lib/data/public";
import { sql } from "./helpers";

// 다른 DB 테스트 파일이 병렬로 임시 사례를 만들 수 있으므로, 샘플 6건을 기준으로 단언한다.
const SAMPLE_SLUGS = [
  "성수동-32평-아파트-인테리어",
  "마포구-24평-빌라-인테리어",
  "분당-45평-아파트-인테리어",
  "연남동-18평-카페-인테리어",
  "강남구-40평-쇼룸-인테리어",
  "판교-60평-사무실-인테리어",
];

describe("공개 데이터 조회(샘플 시드 상태)", () => {
  it("listPublishedProjects: 샘플 6건, 대표 사진 포함", async () => {
    const list = await listPublishedProjects();
    const samples = list.filter((p) => SAMPLE_SLUGS.includes(p.slug));
    expect(samples).toHaveLength(6);
    expect(samples[0].slug).toBe(SAMPLE_SLUGS[0]);
    expect(samples[0].cover?.url).toMatch(/^\/samples\/.+\.webp$/);
    expect(samples[0].cover?.width).toBe(1600);
  });

  it("getFeaturedProjects: 3건, limit 적용", async () => {
    expect(await getFeaturedProjects()).toHaveLength(3);
    expect(await getFeaturedProjects(2)).toHaveLength(2);
  });

  it("getProjectBySlug: 상세와 사진 목록, 없는 slug는 null", async () => {
    const p = await getProjectBySlug("성수동-32평-아파트-인테리어");
    expect(p?.images).toHaveLength(4);
    expect(p?.before?.url).toBe("/samples/living-before.webp");
    expect(p?.after?.url).toBe("/samples/living-after.webp");
    expect(await getProjectBySlug("없는-사례")).toBeNull();
  });

  it("getRelatedProjects: 자신을 뺀 같은 카테고리", async () => {
    const p = await getProjectBySlug("성수동-32평-아파트-인테리어");
    const rel = await getRelatedProjects({ id: p!.id, category: p!.category });
    expect(rel.length).toBeGreaterThanOrEqual(2);
    expect(rel.length).toBeLessThanOrEqual(3);
    expect(rel.every((r) => r.category === "residential" && r.id !== p!.id)).toBe(true);
    expect(rel.map((r) => r.slug)).toEqual(expect.arrayContaining([SAMPLE_SLUGS[1], SAMPLE_SLUGS[2]].slice(0, rel.length)));
  });

  it("getBeforeAfterHighlight: 결과 존재", async () => {
    const h = await getBeforeAfterHighlight();
    expect(h?.project.slug).toBe("성수동-32평-아파트-인테리어");
    expect(h?.before.url).toBe("/samples/living-before.webp");
  });

  it("getTestimonials / getFaqs", async () => {
    expect(await getTestimonials()).toHaveLength(3);
    expect(await getTestimonials({ featuredOnly: true })).toHaveLength(2);
    const pid = (await getProjectBySlug("마포구-24평-빌라-인테리어"))!.id;
    expect(await getTestimonials({ projectId: pid })).toHaveLength(1);
    expect(await getFaqs()).toHaveLength(6);
    expect(await getFaqs(2)).toHaveLength(2);
  });

  it("getActiveBanner: 지금은 있고 과거 시점은 null", async () => {
    expect(await getActiveBanner()).not.toBeNull();
    expect(await getActiveBanner(new Date("2000-01-01"))).toBeNull();
  });

  it("getPublicSettings: notify_email 키 없음, 샘플 값 존재", async () => {
    const s = await getPublicSettings();
    expect("notify_email" in s).toBe(false);
    expect(s.company_name).toBe("(주)틈디자인스튜디오");
    expect(Array.isArray(s.stats)).toBe(true);
  });
});

describe("비공개·누락 처리", () => {
  const slug = "마포구-24평-빌라-인테리어";
  beforeAll(async () => {
    await sql("update public.projects set is_published = false where slug = $1", [slug]);
  });
  afterAll(async () => {
    await sql("update public.projects set is_published = true where slug = $1", [slug]);
  });

  it("비공개 사례는 getProjectBySlug가 null이고 목록에서 빠진다", async () => {
    expect(await getProjectBySlug(slug)).toBeNull();
    expect((await listPublishedProjects()).some((p) => p.slug === slug)).toBe(false);
  });
});

describe("대표 사진이 없는 사례", () => {
  const slug = "판교-60평-사무실-인테리어";
  beforeAll(async () => {
    await sql("update public.projects set cover_image_id = null where slug = $1", [slug]);
  });
  afterAll(async () => {
    await sql(
      `update public.projects set cover_image_id = '20000000-0000-4000-8000-00000000000c' where slug = $1`,
      [slug],
    );
  });

  it("cover가 null로 나오고 조회는 실패하지 않는다", async () => {
    const list = await listPublishedProjects();
    expect(list.find((p) => p.slug === slug)?.cover).toBeNull();
    expect((await getProjectBySlug(slug))?.cover).toBeNull();
  });
});

describe("조회 실패", () => {
  it("DB 오류 시 throw하지 않고 빈 값/기본값을 돌려준다", async () => {
    const orig = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:1";
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      // 읽기 요청은 클라이언트가 재시도하므로 병렬로 호출한다
      const [list, settings, project] = await Promise.all([
        listPublishedProjects(),
        getPublicSettings(),
        getProjectBySlug("x"),
      ]);
      expect(list).toEqual([]);
      expect(settings.company_name).toBe("(주)틈디자인스튜디오");
      expect(project).toBeNull();
      expect(spy).toHaveBeenCalled();
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = orig;
      spy.mockRestore();
    }
  }, 30000);
});
