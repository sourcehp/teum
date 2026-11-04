import { z } from "zod";
import { BUDGET_RANGES, CATEGORIES } from "@/lib/domain/labels";
import { josa } from "@/lib/domain/josa";
import { normalizePhone } from "@/lib/domain/phone";

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

// --- 사이트 설정 ---------------------------------------------------------------

/** 비어 있음 또는 https:// 주소만 허용한다(내부 경로 `/` 는 허용하지 않음). */
const httpsUrl = (label: string) =>
  z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v, ctx) => {
      const s = (v ?? "").trim();
      if (s === "") return "";
      const r = bannerLink.safeParse(s);
      if (!r.success || s.startsWith("/")) {
        ctx.addIssue({ code: "custom", message: `${josa(label, "은는")} https:// 로 시작하는 주소만 쓸 수 있습니다` });
        return z.NEVER;
      }
      return s;
    });

const settingsText = (max: number, label: string) =>
  z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => (v ?? "").replace(/\r\n/g, "\n").trim())
    .pipe(z.string().max(max, { error: `${josa(label, "은는")} ${max.toLocaleString("ko-KR")}자까지 쓸 수 있습니다` }));

const settingsPhone = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v, ctx) => {
    const s = (v ?? "").trim();
    if (s === "") return "";
    const n = normalizePhone(s);
    if (!n) {
      ctx.addIssue({ code: "custom", message: "전화번호 형식이 맞지 않습니다. 예: 02-123-4567, 010-1234-5678" });
      return z.NEVER;
    }
    return n;
  });

const settingsEmail = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v) => (v ?? "").trim())
  .pipe(
    z.union([
      z.literal(""),
      z.string().max(200, { error: "이메일은 200자까지 쓸 수 있습니다" }).pipe(z.email({ error: "이메일 형식이 맞지 않습니다" })),
    ]),
  );

const patternText = (re: RegExp, msg: string) =>
  z
    .union([z.string(), z.undefined(), z.null()])
    .transform((v) => (v ?? "").trim())
    .pipe(z.union([z.literal(""), z.string().regex(re, { error: msg })]));

export const STORAGE_IMAGE_PATH = /^(settings|partners|visual)\/[0-9a-f-]{36}\.webp$/;
const SAMPLE_IMAGE_PATH = /^\/samples\/[a-z0-9-]+\.webp$/;

/** 빈 값(없음), Storage 경로, 또는 변경하지 않은 `/samples/...` 값만 허용한다. */
const imagePath = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((v, ctx) => {
    const s = (v ?? "").trim();
    if (s === "") return null;
    if (STORAGE_IMAGE_PATH.test(s) || SAMPLE_IMAGE_PATH.test(s)) return s;
    ctx.addIssue({ code: "custom", message: "사진 경로가 올바르지 않습니다. 사진을 다시 올려 주세요" });
    return z.NEVER;
  });

/** 폼은 JSON 문자열을, 코드는 배열을 넘길 수 있다. 깨진 JSON 은 항목 오류로 돌려준다. */
function jsonList<T extends z.ZodType>(item: T, max: number, label: string) {
  return z
    .union([z.string(), z.array(z.unknown()), z.undefined(), z.null()])
    .transform((v, ctx) => {
      if (v === undefined || v === null) return [] as unknown[];
      if (Array.isArray(v)) return v;
      const s = v.trim();
      if (s === "") return [] as unknown[];
      try {
        const parsed: unknown = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* 아래에서 오류 처리 */
      }
      ctx.addIssue({ code: "custom", message: `${label} 입력 형식이 올바르지 않습니다. 화면을 새로 고친 뒤 다시 시도해 주세요` });
      return z.NEVER;
    })
    .pipe(z.array(item).max(max, { error: `${josa(label, "은는")} 최대 ${max}개까지 등록할 수 있습니다` }));
}

const strField = (min: number, max: number, emptyMsg: string, maxMsg: string) =>
  z
    .union([z.string(), z.number(), z.undefined(), z.null()])
    .transform((v) => (v === undefined || v === null ? "" : String(v)).trim())
    .pipe(z.string().min(min, { error: emptyMsg }).max(max, { error: maxMsg }));

const statItem = z.object({
  label: strField(1, 20, "실적 항목 이름을 입력해 주세요", "실적 항목 이름은 20자까지 쓸 수 있습니다"),
  value: strField(1, 10, "실적 숫자를 입력해 주세요", "실적 숫자는 10자까지 쓸 수 있습니다"),
  suffix: strField(0, 5, "", "실적 단위는 5자까지 쓸 수 있습니다"),
});
const guaranteeItem = z.object({
  title: strField(1, 30, "보증 제목을 입력해 주세요", "보증 제목은 30자까지 쓸 수 있습니다"),
  description: strField(0, 100, "", "보증 설명은 100자까지 쓸 수 있습니다"),
});
const partnerItem = z.object({
  name: strField(1, 40, "파트너 이름을 입력해 주세요", "파트너 이름은 40자까지 쓸 수 있습니다"),
  logo_path: imagePath.transform((v) => v ?? ""),
  url: httpsUrl("파트너 링크"),
});
const visualWorkItem = z.object({
  client_name: strField(1, 40, "클라이언트명을 입력해 주세요", "클라이언트명은 40자까지 쓸 수 있습니다"),
  summary: strField(0, 80, "", "작업 내용은 80자까지 쓸 수 있습니다"),
  logo_path: imagePath.transform((v) => v ?? ""),
  url: httpsUrl("작업 링크"),
});

const settingsFields = z.object({
  company_name: settingsText(200, "회사명"),
  ceo_name: settingsText(200, "대표자명"),
  business_number: settingsText(200, "사업자등록번호"),
  address: settingsText(200, "주소"),
  phone: settingsPhone,
  email: settingsEmail,
  hero_title: settingsText(200, "메인 문구"),
  hero_subtitle: settingsText(200, "보조 문구"),
  benefit_text: settingsText(200, "혜택 문구"),
  philosophy_text: settingsText(3000, "디자인 철학"),
  ceo_greeting: settingsText(3000, "대표 인사말"),
  instagram_url: httpsUrl("인스타그램 주소"),
  blog_url: httpsUrl("블로그 주소"),
  kakao_channel_url: httpsUrl("카카오톡 채널 주소"),
  notify_email: settingsEmail,
  ga4_id: patternText(/^G-[A-Z0-9]+$/, "측정 ID는 G-로 시작하는 영문 대문자·숫자여야 합니다 (예: G-ABC123XYZ)"),
  naver_site_verification: patternText(/^[A-Za-z0-9_-]{1,100}$/, "인증 값은 영문, 숫자, -, _ 만 쓸 수 있습니다 (100자 이내)"),
  google_site_verification: patternText(/^[A-Za-z0-9_-]{1,100}$/, "인증 값은 영문, 숫자, -, _ 만 쓸 수 있습니다 (100자 이내)"),
  logo_path: imagePath,
  hero_image_path: imagePath,
  ceo_image_path: imagePath,
  stats: jsonList(statItem, 6, "실적"),
  guarantees: jsonList(guaranteeItem, 6, "보증"),
  partners: jsonList(partnerItem, 20, "파트너"),
  visual_works: jsonList(visualWorkItem, 20, "시각 디자인 작업"),
});
export const settingsSchema = z.preprocess(fromForm(settingsFields), settingsFields);
export type SettingsInput = z.infer<typeof settingsFields>;
