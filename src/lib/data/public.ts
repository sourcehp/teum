import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { pickBanner } from "@/lib/domain/banner";
import type { BudgetRange, Category } from "@/lib/domain/labels";
import { mediaUrl } from "@/lib/media";
import type { Database } from "@/lib/supabase/types";

type Tables = Database["public"]["Tables"];
export type PublicSettings = Database["public"]["Views"]["public_site_settings"]["Row"];
export type Testimonial = Tables["testimonials"]["Row"];
export type Faq = Tables["faqs"]["Row"];
export type Banner = Tables["banners"]["Row"];

type ProjectRow = Tables["projects"]["Row"];
type ImageRow = Tables["project_images"]["Row"];

export type PublicImage = { id: string; url: string; alt: string; width: number; height: number };

export type ProjectCard = {
  id: string;
  slug: string;
  title: string;
  category: Category;
  location: string;
  area_pyeong: number | null;
  budget_range: BudgetRange;
  summary: string;
  /** 대표 사진이 없을 수 있다(삭제·미지정). 화면에서는 자리표시 배경으로 대체한다. */
  cover: PublicImage | null;
};

export type ProjectDetail = ProjectCard & {
  duration_weeks: number | null;
  completed_on: string | null;
  body: string;
  images: PublicImage[];
  before: PublicImage | null;
  after: PublicImage | null;
  seo_title: string | null;
  seo_description: string | null;
};

/** 설정 행이 없거나 조회에 실패했을 때 쓰는 기본값. 회사명만 채운다. */
export const DEFAULT_SETTINGS: PublicSettings = {
  id: 1,
  company_name: "(주)틈디자인스튜디오",
  ceo_name: "",
  business_number: "",
  address: "",
  phone: "",
  email: "",
  hero_title: "",
  hero_subtitle: "",
  benefit_text: "",
  philosophy_text: "",
  ceo_greeting: "",
  instagram_url: "",
  blog_url: "",
  kakao_channel_url: "",
  ga4_id: "",
  naver_site_verification: "",
  google_site_verification: "",
  logo_path: null,
  hero_image_path: null,
  ceo_image_path: null,
  stats: [],
  guarantees: [],
  partners: [],
  updated_at: new Date(0).toISOString(),
};

function toImage(row: ImageRow): PublicImage | null {
  const url = mediaUrl(row.storage_path);
  if (!url) return null;
  return { id: row.id, url, alt: row.alt, width: row.width, height: row.height };
}

async function loadImages(
  client: ReturnType<typeof createPublicClient>,
  ids: string[],
): Promise<Map<string, PublicImage>> {
  const map = new Map<string, PublicImage>();
  if (ids.length === 0) return map;
  const { data, error } = await client.from("project_images").select("*").in("id", ids);
  if (error) throw error;
  for (const row of data ?? []) {
    const img = toImage(row);
    if (img) map.set(row.id, img);
  }
  return map;
}

async function toCards(
  client: ReturnType<typeof createPublicClient>,
  rows: ProjectRow[],
): Promise<ProjectCard[]> {
  const ids = rows.map((r) => r.cover_image_id).filter((x): x is string => !!x);
  const images = await loadImages(client, ids);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category as Category,
    location: r.location,
    area_pyeong: r.area_pyeong,
    budget_range: r.budget_range as BudgetRange,
    summary: r.summary,
    cover: (r.cover_image_id && images.get(r.cover_image_id)) || null,
  }));
}

async function safe<T>(fallback: T, label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[data/public] ${label} 실패`, e);
    return fallback;
  }
}

export async function getPublicSettings(): Promise<PublicSettings> {
  return safe(DEFAULT_SETTINGS, "getPublicSettings", async () => {
    const { data, error } = await createPublicClient()
      .from("public_site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    return data ?? DEFAULT_SETTINGS;
  });
}

/** 공개 사례 조회 공통부. 정렬은 sort_order, created_at desc로 고정한다. */
async function queryProjects(
  opts: { featured?: boolean; category?: string; excludeId?: string; limit?: number } = {},
): Promise<ProjectCard[]> {
  const client = createPublicClient();
  let q = client.from("projects").select("*").eq("is_published", true);
  if (opts.featured) q = q.eq("is_featured", true);
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.excludeId) q = q.neq("id", opts.excludeId);
  q = q.order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (opts.limit !== undefined) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return toCards(client, data ?? []);
}

export async function listPublishedProjects(): Promise<ProjectCard[]> {
  return safe([], "listPublishedProjects", () => queryProjects());
}

export async function getFeaturedProjects(limit = 6): Promise<ProjectCard[]> {
  return safe([], "getFeaturedProjects", () =>
    queryProjects({ featured: true, limit }),
  );
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  return safe(null, "getProjectBySlug", async () => {
    const client = createPublicClient();
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const { data: imgRows, error: imgErr } = await client
      .from("project_images")
      .select("*")
      .eq("project_id", data.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (imgErr) throw imgErr;
    const images = (imgRows ?? []).map(toImage).filter((x): x is PublicImage => x !== null);
    const byId = new Map(images.map((i) => [i.id, i]));
    const [card] = await toCards(client, [data]);
    return {
      ...card,
      cover: (data.cover_image_id && byId.get(data.cover_image_id)) || null,
      duration_weeks: data.duration_weeks,
      completed_on: data.completed_on,
      body: data.body,
      images,
      before: (data.before_image_id && byId.get(data.before_image_id)) || null,
      after: (data.after_image_id && byId.get(data.after_image_id)) || null,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
    };
  });
}

export async function getRelatedProjects(
  p: { id: string; category: string },
  limit = 3,
): Promise<ProjectCard[]> {
  return safe([], "getRelatedProjects", () =>
    queryProjects({ category: p.category, excludeId: p.id, limit }),
  );
}

export async function getBeforeAfterHighlight(): Promise<{
  project: ProjectCard;
  before: PublicImage;
  after: PublicImage;
} | null> {
  return safe(null, "getBeforeAfterHighlight", async () => {
    const client = createPublicClient();
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .not("before_image_id", "is", null)
      .not("after_image_id", "is", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    const row = data?.[0];
    if (!row?.before_image_id || !row.after_image_id) return null;
    const images = await loadImages(client, [row.before_image_id, row.after_image_id, ...(row.cover_image_id ? [row.cover_image_id] : [])]);
    const before = images.get(row.before_image_id);
    const after = images.get(row.after_image_id);
    if (!before || !after) return null;
    const [project] = await toCards(client, [row]);
    return { project, before, after };
  });
}

export async function getTestimonials(
  opts: { featuredOnly?: boolean; projectId?: string } = {},
): Promise<Testimonial[]> {
  return safe([], "getTestimonials", async () => {
    let q = createPublicClient().from("testimonials").select("*").eq("is_published", true);
    if (opts.featuredOnly) q = q.eq("is_featured", true);
    if (opts.projectId) q = q.eq("project_id", opts.projectId);
    const { data, error } = await q
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });
}

export async function getFaqs(limit?: number): Promise<Faq[]> {
  return safe([], "getFaqs", async () => {
    let q = createPublicClient()
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (limit !== undefined) q = q.limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  });
}

export async function getActiveBanner(now: Date = new Date()): Promise<Banner | null> {
  return safe(null, "getActiveBanner", async () => {
    const { data, error } = await createPublicClient().from("banners").select("*").eq("is_active", true);
    if (error) throw error;
    return pickBanner(data ?? [], now);
  });
}
