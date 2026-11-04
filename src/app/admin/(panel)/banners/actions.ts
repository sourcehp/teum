"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { fieldErrorsOf, GENERIC_ERROR, type SaveState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { bannerSchema } from "@/lib/admin/schemas";

const idSchema = z.uuid({ error: "잘못된 요청입니다" });

export async function saveBanner(id: string | null, _prev: SaveState, fd: FormData): Promise<SaveState> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema.safeParse(id).success) return { ok: false, error: GENERIC_ERROR };
  const parsed = bannerSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return fieldErrorsOf(parsed.error);

  if (id) {
    const { data, error } = await supabase.from("banners").update(parsed.data).eq("id", id).select("id");
    if (error || !data?.length) return { ok: false, error: GENERIC_ERROR };
    revalidateSite();
    return { ok: true, id };
  }
  const { data, error } = await supabase.from("banners").insert(parsed.data).select("id").single();
  if (error || !data) return { ok: false, error: GENERIC_ERROR };
  revalidateSite();
  redirect(`/admin/banners/${data.id}`);
}

export async function deleteBanner(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  const rid = idSchema.parse(id);
  const { error } = await supabase.from("banners").delete().eq("id", rid);
  if (error) throw new Error(GENERIC_ERROR);
  revalidateSite();
  redirect("/admin/banners");
}
