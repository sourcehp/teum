import Link from "next/link";
import { EntityList, type EntityRow } from "@/components/admin/EntityList";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { reorderFaq } from "./actions";

export const metadata = { title: "자주 묻는 질문" };

export default async function FaqsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, is_published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const rows: EntityRow[] = (data ?? []).map((f) => ({
    id: f.id,
    title: f.question,
    badges: [f.is_published ? { text: "공개", tone: "on" } : { text: "비공개", tone: "off" }],
  }));

  return (
    <div>
      <PageHeader
        title="자주 묻는 질문"
        description="왼쪽 손잡이를 끌어 순서를 바꿀 수 있습니다. 위쪽 질문이 먼저 보입니다."
        actions={
          <Link href="/admin/faqs/new" className="bg-ink px-4 py-2 text-sm font-medium text-bg hover:bg-accent-ink">
            새 FAQ 추가
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p className="border border-line bg-surface p-6 text-center text-sm text-muted">
          아직 등록된 FAQ가 없습니다. &quot;새 FAQ 추가&quot;를 눌러 첫 질문을 만들어 보세요.
        </p>
      ) : (
        <EntityList rows={rows} basePath="/admin/faqs" reorder={reorderFaq} />
      )}
    </div>
  );
}
