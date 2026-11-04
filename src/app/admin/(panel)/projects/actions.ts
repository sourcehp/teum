"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { firstError } from "@/lib/admin/results";
import { revalidateSite } from "@/lib/admin/revalidate";
import { projectSchema } from "@/lib/admin/schemas";
import { slugify, uniqueSlug } from "@/lib/domain/slug";
import type { Database } from "@/lib/supabase/types";

type Db = SupabaseClient<Database>;
export type SaveState = { ok: boolean; id?: string; fieldErrors?: Record<string, string>; error?: string };

const idSchema = z.uuid({ error: "잘못된 요청입니다" });
const idsSchema = z.array(z.uuid()).max(500);
const roleSchema = z.enum(["cover", "before", "after"]).nullable();
const BUCKET = "media";
const GENERIC_ERROR = "저장하지 못했습니다. 잠시 후 다시 시도해 주세요";

async function takenSlugs(supabase: Db, base: string, exceptId: string | null): Promise<string[]> {
  let q = supabase.from("projects").select("slug").like("slug", `${base.replace(/[%_\\]/g, "\\$&")}%`);
  if (exceptId) q = q.neq("id", exceptId);
  const { data } = await q;
  return (data ?? []).map((r) => r.slug);
}

export async function saveProject(id: string | null, _prev: SaveState, fd: FormData): Promise<SaveState> {
  const { supabase } = await requireAdmin();
  if (id !== null && !idSchema.safeParse(id).success) return { ok: false, error: GENERIC_ERROR };

  const parsed = projectSchema.safeParse(Object.fromEntries(fd.entries()));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors, error: "입력 내용을 확인해 주세요" };
  }
  const { slug: rawSlug, ...rest } = parsed.data;
  const base = slugify(rawSlug || parsed.data.title);

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = uniqueSlug(base, await takenSlugs(supabase, base, id));
    if (id) {
      const { data, error } = await supabase.from("projects").update({ ...rest, slug }).eq("id", id).select("id");
      if (error?.code === "23505") continue;
      if (error || !data?.length) return { ok: false, error: GENERIC_ERROR };
      revalidateSite();
      return { ok: true, id };
    }
    const { data: first } = await supabase
      .from("projects")
      .select("sort_order")
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...rest, slug, sort_order: (first?.sort_order ?? 0) - 1 })
      .select("id")
      .single();
    if (error?.code === "23505") continue;
    if (error || !data) return { ok: false, error: GENERIC_ERROR };
    revalidateSite();
    redirect(`/admin/projects/${data.id}`);
  }
  return { ok: false, error: GENERIC_ERROR };
}

async function removeStorage(supabase: Db, paths: string[]): Promise<void> {
  const real = paths.filter((p) => !p.startsWith("/") && !p.startsWith("http"));
  for (let i = 0; i < real.length; i += 100) {
    const { error } = await supabase.storage.from(BUCKET).remove(real.slice(i, i + 100));
    if (error) console.error("[projects] storage remove failed", error.message);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { supabase } = await requireAdmin();
  const pid = idSchema.parse(id);

  // 저장소의 projects/{id}/ 아래 파일을 모두 지운다(100개씩 페이지 처리). 실패해도 행은 지운다.
  try {
    const dir = `projects/${pid}`;
    const paths: string[] = [];
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await supabase.storage.from(BUCKET).list(dir, { limit: 100, offset });
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const f of data) if (f.name) paths.push(`${dir}/${f.name}`);
      if (data.length < 100) break;
    }
    await removeStorage(supabase, paths);
  } catch (e) {
    console.error("[projects] storage list failed", e);
  }

  const { error } = await supabase.from("projects").delete().eq("id", pid);
  if (error) throw new Error(GENERIC_ERROR);
  revalidateSite();
  redirect("/admin/projects");
}

const imageItem = z.object({
  storage_path: z.string().max(300),
  width: z.number().int().positive().max(100000),
  height: z.number().int().positive().max(100000),
});

export async function addProjectImages(
  projectId: string,
  items: { storage_path: string; width: number; height: number }[],
): Promise<void> {
  const { supabase } = await requireAdmin();
  const pid = idSchema.parse(projectId);
  const list = z.array(imageItem).min(1).max(100).parse(items);
  const prefix = `projects/${pid}/`;
  for (const it of list) {
    const p = it.storage_path;
    if (!p.startsWith(prefix) || !p.endsWith(".webp") || p.includes("..") || p.slice(prefix.length).includes("/")) {
      throw new Error("잘못된 사진 경로입니다");
    }
  }

  const { data: project } = await supabase.from("projects").select("id, cover_image_id").eq("id", pid).maybeSingle();
  if (!project) throw new Error("사례를 찾을 수 없습니다");
  const { data: last } = await supabase
    .from("project_images")
    .select("sort_order")
    .eq("project_id", pid)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  let order = (last?.sort_order ?? -1) + 1;
  const { data: inserted, error } = await supabase
    .from("project_images")
    .insert(list.map((it) => ({ project_id: pid, ...it, sort_order: order++ })))
    .select("id, sort_order");
  if (error || !inserted) throw new Error(GENERIC_ERROR);

  if (!project.cover_image_id) {
    const firstImage = [...inserted].sort((a, b) => a.sort_order - b.sort_order)[0];
    await supabase.from("projects").update({ cover_image_id: firstImage.id }).eq("id", pid);
  }
  revalidateSite();
}

export async function updateImageAlt(imageId: string, alt: string): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = idSchema.parse(imageId);
  const text = z.string().max(200).parse(alt).trim();
  const { error } = await supabase.from("project_images").update({ alt: text }).eq("id", id);
  if (error) throw new Error(GENERIC_ERROR);
  revalidateSite();
}

export async function deleteProjectImage(imageId: string): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = idSchema.parse(imageId);
  const { data: img } = await supabase.from("project_images").select("storage_path").eq("id", id).maybeSingle();
  if (!img) return;
  const { error } = await supabase.from("project_images").delete().eq("id", id);
  if (error) throw new Error(GENERIC_ERROR);
  await removeStorage(supabase, [img.storage_path]); // /samples/ 경로는 건너뜀
  revalidateSite();
}

export async function setProjectImageRole(
  projectId: string,
  imageId: string,
  role: "cover" | "before" | "after" | null,
): Promise<void> {
  const { supabase } = await requireAdmin();
  const pid = idSchema.parse(projectId);
  const iid = idSchema.parse(imageId);
  const r = roleSchema.parse(role);

  const { data: img } = await supabase
    .from("project_images")
    .select("id")
    .eq("id", iid)
    .eq("project_id", pid)
    .maybeSingle();
  if (!img) throw new Error("이 사례의 사진이 아닙니다");

  const { data: project } = await supabase
    .from("projects")
    .select("cover_image_id, before_image_id, after_image_id")
    .eq("id", pid)
    .maybeSingle();
  if (!project) throw new Error("사례를 찾을 수 없습니다");

  const patch: Database["public"]["Tables"]["projects"]["Update"] = {};
  if (r === null) {
    // 지정 해제: 이 사진이 맡고 있던 역할을 모두 비운다.
    if (project.cover_image_id === iid) patch.cover_image_id = null;
    if (project.before_image_id === iid) patch.before_image_id = null;
    if (project.after_image_id === iid) patch.after_image_id = null;
  } else {
    patch[`${r}_image_id` as const] = iid;
  }
  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from("projects").update(patch).eq("id", pid);
    if (error) throw new Error(GENERIC_ERROR);
  }
  revalidateSite();
}

export async function reorderProjectImages(projectId: string, ids: string[]): Promise<void> {
  const { supabase } = await requireAdmin();
  const pid = idSchema.parse(projectId);
  const list = idsSchema.parse(ids);
  const results = await Promise.all(
    list.map((id, i) => supabase.from("project_images").update({ sort_order: i }).eq("id", id).eq("project_id", pid)),
  );
  if (firstError(results)) throw new Error(GENERIC_ERROR);
  revalidateSite();
}

export async function reorderProjects(ids: string[]): Promise<void> {
  const { supabase } = await requireAdmin();
  const list = idsSchema.parse(ids);
  const results = await Promise.all(list.map((id, i) => supabase.from("projects").update({ sort_order: i }).eq("id", id)));
  if (firstError(results)) throw new Error(GENERIC_ERROR);
  revalidateSite();
}
