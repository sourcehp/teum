import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { ImageManager } from "@/components/admin/ImageManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteProject } from "../actions";

export const metadata = { title: "시공 사례 수정" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data: p } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  const { data: images } = await supabase
    .from("project_images")
    .select("id, storage_path, alt")
    .eq("project_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl space-y-10">
      <PageHeader
        title={p.title}
        description={p.is_published ? "공개 중" : "비공개"}
        actions={
          <>
            {p.is_published ? (
              <a
                href={`/projects/${encodeURIComponent(p.slug)}`}
                target="_blank"
                rel="noreferrer"
                className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent"
              >
                공개 페이지 보기
              </a>
            ) : null}
            <Link href="/admin/projects" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
              목록으로
            </Link>
          </>
        }
      />
      <ProjectForm
        id={p.id}
        initial={{
          title: p.title,
          slug: p.slug,
          category: p.category,
          location: p.location,
          area_pyeong: p.area_pyeong,
          budget_range: p.budget_range,
          duration_weeks: p.duration_weeks,
          completed_on: p.completed_on,
          summary: p.summary,
          body: p.body,
          is_published: p.is_published,
          is_featured: p.is_featured,
          is_sample: p.is_sample,
          seo_title: p.seo_title,
          seo_description: p.seo_description,
          updated_at: p.updated_at,
        }}
      />
      <ImageManager
        projectId={p.id}
        images={images ?? []}
        coverId={p.cover_image_id}
        beforeId={p.before_image_id}
        afterId={p.after_image_id}
      />
      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold">사례 삭제</h2>
        <p className="mt-1 text-sm text-muted">사진도 함께 삭제되며 되돌릴 수 없습니다. 잠시 숨기려면 위에서 &quot;공개&quot;를 해제하세요.</p>
        <form action={deleteProject.bind(null, p.id)} className="mt-3">
          <ConfirmButton message="이 시공 사례와 모든 사진을 삭제할까요? 되돌릴 수 없습니다.">사례 삭제</ConfirmButton>
        </form>
      </section>
    </div>
  );
}
