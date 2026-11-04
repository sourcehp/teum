import { z } from "zod";
import { normalizePhone } from "@/lib/domain/phone";
import { BUDGET_RANGES, CATEGORIES } from "@/lib/domain/labels";

/** 빈 문자열(공백만 포함)을 undefined로 바꾼다. */
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const optional = <T extends z.ZodType>(s: T) => z.preprocess(emptyToUndefined, s.optional());

export const step1Schema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요").max(30, "이름은 30자 이내로 입력해 주세요"),
  phone: z
    .string()
    .transform((v, ctx) => {
      const n = normalizePhone(v);
      if (n === null) {
        ctx.addIssue({ code: "custom", message: "연락처 형식을 확인해 주세요" });
        return z.NEVER;
      }
      return n;
    }),
  space_type: z.enum(CATEGORIES, { error: "공간 유형을 선택해 주세요" }),
  privacy: z.literal("on", { error: "개인정보 수집·이용에 동의해 주세요" }),
});

export const step2Schema = z.object({
  email: optional(z.string().trim().max(254).pipe(z.email("이메일 형식을 확인해 주세요"))),
  region: optional(z.string().trim().max(50, "지역은 50자 이내로 입력해 주세요")),
  area_pyeong: optional(
    z.coerce.number({ error: "평수를 숫자로 입력해 주세요" }).gt(0, "평수를 확인해 주세요").max(10000, "평수를 확인해 주세요"),
  ),
  budget_range: optional(z.enum(BUDGET_RANGES, { error: "예산 범위를 확인해 주세요" })),
  desired_start: optional(z.string().trim().max(50, "희망 시기는 50자 이내로 입력해 주세요")),
  message: optional(z.string().trim().max(2000, "문의 내용은 2000자 이내로 입력해 주세요")),
});

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
