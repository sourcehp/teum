import Link from "next/link";
import { EntityList, type EntityRow } from "@/components/admin/EntityList";
import { PageHeader } from "@/components/admin/PageHeader";
import { SampleWarning } from "@/components/admin/SampleWarning";
import { requireAdmin } from "@/lib/admin/auth";
import { reorderTestimonial } from "./actions";

export const metadata = { title: "고객 후기" };

export default async function TestimonialsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("testimonials")
    .select("id, customer_label, space_label, rating, body, is_published, is_featured, is_sample")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const list = data ?? [];
  const rows: EntityRow[] = list.map((t) => ({
    id: t.id,
    title: `${t.customer_label}${t.space_label ? ` · ${t.space_label}` : ""}`,
    subtitle: `${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}  ${t.body.replace(/\s+/g, " ").slice(0, 60)}`,
    badges: [
      t.is_published ? { text: "공개", tone: "on" } : { text: "비공개", tone: "off" },
      ...(t.is_featured ? [{ text: "홈 노출", tone: "accent" as const }] : []),
      ...(t.is_sample ? [{ text: "샘플", tone: "off" as const }] : []),
    ],
  }));
  const publishedSamples = list.filter((t) => t.is_sample && t.is_published).length;

  return (
    <div>
      <PageHeader
        title="고객 후기"
        description="왼쪽 손잡이를 끌어 순서를 바꿀 수 있습니다. 위쪽 후기가 홈페이지에 먼저 보입니다."
        actions={
          <Link href="/admin/testimonials/new" className="bg-ink px-4 py-2 text-sm font-medium text-bg hover:bg-accent-ink">
            새 후기 추가
          </Link>
        }
      />
      <SampleWarning count={publishedSamples} />
      {rows.length === 0 ? (
        <p className="border border-line bg-surface p-6 text-center text-sm text-muted">
          아직 등록된 후기가 없습니다. &quot;새 후기 추가&quot;를 눌러 첫 후기를 만들어 보세요.
        </p>
      ) : (
        <EntityList rows={rows} basePath="/admin/testimonials" reorder={reorderTestimonial} />
      )}
    </div>
  );
}
