"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin/auth";
import { fieldErrorsOf, GENERIC_ERROR, type SaveState } from "@/lib/admin/form";
import { revalidateSite } from "@/lib/admin/revalidate";
import { settingsSchema, STORAGE_IMAGE_PATH } from "@/lib/admin/schemas";
import type { Database } from "@/lib/supabase/types";

const BUCKET = "media";

function partnerLogos(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((p) => (p && typeof p === "object" ? (p as { logo_path?: unknown }).logo_path : null)).filter((x): x is string => typeof x === "string");
}

/** Storage 에 올린 파일만 지운다. `/samples/` 같은 정적 경로와 형식이 다른 값은 건드리지 않는다. */
async function removeStorage(supabase: SupabaseClient<Database>, paths: string[]): Promise<void> {
  const real = [...new Set(paths)].filter((p) => STORAGE_IMAGE_PATH.test(p));
  if (real.length === 0) return;
  try {
    const { error } = await supabase.storage.from(BUCKET).remove(real);
    if (error) console.error("[settings] storage remove failed", error.message);
  } catch (e) {
    console.error("[settings] storage remove failed", e);
  }
}

export async function saveSettings(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) return fieldErrorsOf(parsed.error);

  const { data: before, error: readErr } = await supabase
    .from("site_settings")
    .select("logo_path, hero_image_path, ceo_image_path, partners")
    .eq("id", 1)
    .maybeSingle();
  if (readErr) return { ok: false, error: GENERIC_ERROR };

  const { data, error } = await supabase.from("site_settings").update(parsed.data).eq("id", 1).select("id");
  if (error || !data?.length) return { ok: false, error: GENERIC_ERROR };

  // 저장에 성공한 뒤에만, 더 이상 쓰지 않는 이전 사진을 지운다(실패해도 저장 결과는 유지).
  if (before) {
    const next = new Set<string>([
      ...[parsed.data.logo_path, parsed.data.hero_image_path, parsed.data.ceo_image_path].filter((x): x is string => !!x),
      ...partnerLogos(parsed.data.partners),
    ]);
    const old = [before.logo_path, before.hero_image_path, before.ceo_image_path, ...partnerLogos(before.partners)].filter(
      (x): x is string => !!x,
    );
    await removeStorage(supabase, old.filter((p) => !next.has(p)));
  }

  revalidateSite();
  return { ok: true };
}
