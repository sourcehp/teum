import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { FaqForm } from "@/components/admin/FaqForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteFaq } from "../actions";

export const metadata = { title: "FAQ 수정" };

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data: row } = await supabase.from("faqs").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();

  return (
    <div className="max-w-2xl space-y-10">
      <PageHeader
        title="FAQ 수정"
        actions={
          <Link href="/admin/faqs" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            목록으로
          </Link>
        }
      />
      <FaqForm id={row.id} initial={{ question: row.question, answer: row.answer, is_published: row.is_published, updated_at: row.updated_at }} />
      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold">FAQ 삭제</h2>
        <p className="mt-1 text-sm text-muted">삭제하면 되돌릴 수 없습니다. 잠시 숨기려면 위에서 "공개"를 해제하세요.</p>
        <form action={deleteFaq.bind(null, row.id)} className="mt-3">
          <ConfirmButton message="이 FAQ를 삭제할까요? 되돌릴 수 없습니다.">삭제</ConfirmButton>
        </form>
      </section>
    </div>
  );
}
