"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { fieldErrorsOf, GENERIC_ERROR, type SaveState } from "@/lib/admin/form";
import { firstError } from "@/lib/admin/results";
import { revalidateSite } from "@/lib/admin/revalidate";
import { faqSchema } from "@/lib/admin/schemas";

const idSchema = z.uuid({ error: "잘못된 요청입니다" });
const idsSchema = z.array(z.uuid()).max(500);

export async function saveFaq(id: string | null, _prev: SaveState, fd: FormData): Promise<SaveState> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema.safeParse(id).success) return { ok: false, error: GENERIC_ERROR };
  const parsed = faqSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return fieldErrorsOf(parsed.error);

  if (id) {
    const { data, error } = await supabase.from("faqs").update(parsed.data).eq("id", id).select("id");
    if (error || !data?.length) return { ok: false, error: GENERIC_ERROR };
    revalidateSite();
    return { ok: true, id };
  }
  const { data: first } = await supabase
    .from("faqs")
    .select("sort_order")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  const { data, error } = await supabase
    .from("faqs")
    .insert({ ...parsed.data, sort_order: (first?.sort_order ?? 0) - 1 })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: GENERIC_ERROR };
  revalidateSite();
  redirect(`/admin/faqs/${data.id}`);
}

export async function deleteFaq(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  const rid = idSchema.parse(id);
  const { error } = await supabase.from("faqs").delete().eq("id", rid);
  if (error) throw new Error(GENERIC_ERROR);
  revalidateSite();
  redirect("/admin/faqs");
}

export async function reorderFaq(ids: string[]): Promise<void> {
  const { supabase } = await requireAdmin();
  const list = idsSchema.parse(ids);
  const results = await Promise.all(list.map((id, i) => supabase.from("faqs").update({ sort_order: i }).eq("id", id)));
  if (firstError(results)) throw new Error(GENERIC_ERROR);
  revalidateSite();
}
