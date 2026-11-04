import { z } from "zod";
import { BUDGET_RANGES, CATEGORIES } from "@/lib/domain/labels";

const checkbox = z
  .union([z.string(), z.boolean(), z.undefined(), z.null()])
  .transform((v) => v === true || v === "on" || v === "true" || v === "1");

const text = (max: number, msg: string) =>
  z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => (v ?? "").replace(/\r\n/g, "\n"))
    .pipe(z.string().max(max, { error: msg }));

const optionalText = (max: number, msg: string) =>
  text(max, msg).transform((v) => (v.trim() === "" ? null : v));

const optionalNumber = (opts: { int: boolean; min: number; max: number; msg: string }) =>
  z
    .union([z.string(), z.number(), z.undefined(), z.null()])
    .transform((v, ctx) => {
      if (v === undefined || v === null) return null;
      if (typeof v === "string" && v.trim() === "") return null;
      const n = typeof v === "number" ? v : Number(v.trim());
      const ok = Number.isFinite(n) && n >= opts.min && n <= opts.max && (!opts.int || Number.isInteger(n));
      if (!ok) {
        ctx.addIssue({ code: "custom", message: opts.msg });
        return z.NEVER;
      }
      return n;
    });

const optionalDate = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v, ctx) => {
    const s = (v ?? "").trim();
    if (s === "") return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
    if (!m || !d || d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) {
      ctx.addIssue({ code: "custom", message: "날짜를 2026-10-01 형식으로 입력해 주세요" });
      return z.NEVER;
    }
    return s;
  });

const projectFields = z.object({
  title: z
    .string({ error: "제목을 입력해 주세요" })
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, { error: "제목을 입력해 주세요" })
        .max(100, { error: "제목은 100자까지 쓸 수 있습니다" }),
    ),
  slug: text(100, "주소는 100자까지 쓸 수 있습니다").transform((v) => v.trim()),
  category: z.enum(CATEGORIES, { error: "분류를 선택해 주세요" }),
  location: text(50, "지역은 50자까지 쓸 수 있습니다").transform((v) => v.trim()),
  area_pyeong: optionalNumber({ int: false, min: 0.1, max: 100000, msg: "평수는 0보다 큰 숫자로 입력해 주세요" }),
  budget_range: z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => (v ? v : "undisclosed"))
    .pipe(z.enum(BUDGET_RANGES, { error: "예산을 선택해 주세요" })),
  duration_weeks: optionalNumber({ int: true, min: 1, max: 520, msg: "공사 기간은 1~520 사이 정수(주)로 입력해 주세요" }),
  completed_on: optionalDate,
  summary: text(200, "한 줄 요약은 200자까지 쓸 수 있습니다"),
  body: text(10000, "상세 설명은 10,000자까지 쓸 수 있습니다"),
  is_published: checkbox,
  is_featured: checkbox,
  is_sample: checkbox,
  seo_title: optionalText(70, "검색 제목은 70자까지 쓸 수 있습니다"),
  seo_description: optionalText(160, "검색 설명은 160자까지 쓸 수 있습니다"),
});

/** 폼에서 빠진 키(체크 안 한 체크박스 등)를 빈 값으로 채운 뒤 검사한다. */
export const projectSchema = z.preprocess(
  (raw) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(projectFields.shape)) out[k] = r[k] ?? undefined;
    return out;
  },
  projectFields,
);

export type ProjectInput = z.infer<typeof projectSchema>;

// --- 고객 후기 / FAQ / 이벤트 배너 -------------------------------------------

const requiredText = (min: number, max: number, emptyMsg: string, maxMsg: string) =>
  z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => (v ?? "").replace(/\r\n/g, "\n").trim())
    .pipe(z.string().min(min, { error: emptyMsg }).max(max, { error: maxMsg }));

/** 폼에서 빠진 키를 undefined 로 채운 뒤 검사한다(체크박스 등). */
function fromForm<S extends z.ZodObject>(fields: S) {
  return (raw: unknown) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(fields.shape)) out[k] = r[k] ?? undefined;
    return out;
  };
}

const testimonialFields = z.object({
  project_id: z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => (v ?? "").trim())
    .pipe(z.union([z.literal(""), z.uuid({ error: "사례를 다시 선택해 주세요" })]))
    .transform((v) => (v === "" ? null : v)),
  customer_label: requiredText(1, 30, "고객 표기를 입력해 주세요", "고객 표기는 30자까지 쓸 수 있습니다"),
  space_label: requiredText(0, 30, "", "공간 표기는 30자까지 쓸 수 있습니다"),
  rating: z
    .union([z.string(), z.number(), z.undefined(), z.null()])
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .pipe(
      z
        .union([z.string(), z.number()])
        .transform((v) => Number(v))
        .pipe(z.number({ error: "별점을 선택해 주세요" }).int({ error: "별점을 선택해 주세요" }).min(1, { error: "별점을 선택해 주세요" }).max(5, { error: "별점을 선택해 주세요" })),
    ),
  body: requiredText(1, 1000, "후기 내용을 입력해 주세요", "후기는 1,000자까지 쓸 수 있습니다"),
  is_published: checkbox,
  is_featured: checkbox,
  is_sample: checkbox,
});
export const testimonialSchema = z.preprocess(fromForm(testimonialFields), testimonialFields);
export type TestimonialInput = z.infer<typeof testimonialSchema>;

const faqFields = z.object({
  question: requiredText(1, 200, "질문을 입력해 주세요", "질문은 200자까지 쓸 수 있습니다"),
  answer: requiredText(1, 2000, "답변을 입력해 주세요", "답변은 2,000자까지 쓸 수 있습니다"),
  is_published: checkbox,
});
export const faqSchema = z.preprocess(fromForm(faqFields), faqFields);
export type FaqInput = z.infer<typeof faqFields>;

const requiredDate = (emptyMsg: string) =>
  z.union([z.string(), z.undefined(), z.null()]).transform((v, ctx) => {
    const s = (v ?? "").trim();
    if (s === "") {
      ctx.addIssue({ code: "custom", message: emptyMsg });
      return z.NEVER;
    }
    const r = optionalDate.safeParse(s);
    if (!r.success || r.data === null) {
      ctx.addIssue({ code: "custom", message: r.success ? emptyMsg : r.error.issues[0].message });
      return z.NEVER;
    }
    return r.data;
  });

/** 비어 있음, `/` 로 시작하는 사이트 내부 경로(`//`·`\` 제외), 또는 https 주소만 허용한다. */
const bannerLink = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v, ctx) => {
    const s = (v ?? "").trim();
    if (s === "") return null;
    const bad = () => {
      ctx.addIssue({ code: "custom", message: "링크는 / 로 시작하는 사이트 내부 주소나 https:// 주소만 쓸 수 있습니다" });
      return z.NEVER;
    };
    if (s.length > 500 || /[\s\\\u0000-\u001f]/.test(s)) return bad();
    if (s.startsWith("/")) return s.startsWith("//") ? bad() : s;
    try {
      const u = new URL(s);
      return u.protocol === "https:" && u.hostname !== "" && s.toLowerCase().startsWith("https://") ? s : bad();
    } catch {
      return bad();
    }
  });

const bannerFields = z.object({
  message: requiredText(1, 80, "배너 문구를 입력해 주세요", "배너 문구는 80자까지 쓸 수 있습니다"),
  link_url: bannerLink,
  starts_on: requiredDate("시작일을 입력해 주세요"),
  ends_on: requiredDate("종료일을 입력해 주세요"),
  is_active: checkbox,
});
export const bannerSchema = z.preprocess(
  fromForm(bannerFields),
  bannerFields.superRefine((v, ctx) => {
    if (v.ends_on < v.starts_on) {
      ctx.addIssue({ code: "custom", path: ["ends_on"], message: "종료일은 시작일 이후여야 합니다" });
    }
  }),
);
export type BannerInput = z.infer<typeof bannerFields>;
