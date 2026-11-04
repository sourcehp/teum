import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProjectList, type ProjectListItem } from "@/components/admin/ProjectList";
import { SampleWarning } from "@/components/admin/SampleWarning";
import { requireAdmin } from "@/lib/admin/auth";
import { mediaUrl } from "@/lib/media";

export const metadata = { title: "시공 사례" };

export default async function ProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data: rows } = await supabase
    .from("projects")
    .select("id, title, category, is_published, is_featured, is_sample, cover_image_id, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const coverIds = (rows ?? []).map((r) => r.cover_image_id).filter((v): v is string => !!v);
  const { data: covers } = coverIds.length
    ? await supabase.from("project_images").select("id, storage_path").in("id", coverIds)
    : { data: [] as { id: string; storage_path: string }[] };
  const coverPath = new Map((covers ?? []).map((c) => [c.id, c.storage_path]));

  const items: ProjectListItem[] = (rows ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    is_published: r.is_published,
    is_featured: r.is_featured,
    is_sample: r.is_sample,
    cover_url: r.cover_image_id ? mediaUrl(coverPath.get(r.cover_image_id)) : null,
  }));
  const publishedSamples = items.filter((i) => i.is_sample && i.is_published).length;

  return (
    <div>
      <PageHeader
        title="시공 사례"
        description="왼쪽 손잡이를 끌어 순서를 바꿀 수 있습니다. 위쪽 사례가 홈페이지에 먼저 보입니다."
        actions={
          <Link href="/admin/projects/new" className="bg-ink px-4 py-2 text-sm font-medium text-bg hover:bg-accent-ink">
            새 사례 추가
          </Link>
        }
      />
      <SampleWarning count={publishedSamples} />
      {items.length === 0 ? (
        <p className="border border-line bg-surface p-6 text-center text-sm text-muted">
          아직 등록된 사례가 없습니다. &quot;새 사례 추가&quot;를 눌러 첫 사례를 만들어 보세요.
        </p>
      ) : (
        <ProjectList items={items} />
      )}
    </div>
  );
}
