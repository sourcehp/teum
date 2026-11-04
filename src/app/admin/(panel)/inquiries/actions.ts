"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { INQUIRY_STATUSES } from "@/lib/domain/labels";

const schema = z.object({
  id: z.uuid({ error: "잘못된 문의입니다" }),
  status: z.enum(INQUIRY_STATUSES, { error: "상태 값이 올바르지 않습니다" }),
  admin_memo: z.string().max(5000, { error: "메모는 5,000자까지 쓸 수 있습니다" }),
});

export async function updateInquiry(
  id: string,
  _prev: { ok: boolean; error?: string },
  fd: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireAdmin();
  const parsed = schema.safeParse({
    id,
    status: fd.get("status"),
    admin_memo: String(fd.get("admin_memo") ?? "").replace(/\r\n/g, "\n"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요" };
  const { data, error } = await supabase
    .from("inquiries")
    .update({
      status: parsed.data.status,
      admin_memo: parsed.data.admin_memo.trim() === "" ? null : parsed.data.admin_memo,
    })
    .eq("id", parsed.data.id)
    .select("id");
  if (error || !data || data.length === 0) return { ok: false, error: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요" };
  revalidatePath("/admin", "layout"); // 사이드 메뉴의 신규 문의 수 갱신
  return { ok: true };
}
