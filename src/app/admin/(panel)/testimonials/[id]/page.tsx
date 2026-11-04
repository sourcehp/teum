import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteTestimonial } from "../actions";

export const metadata = { title: "고객 후기 수정" };

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data: row } = await supabase.from("testimonials").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();
  const { data: projects } = await supabase.from("projects").select("id, title, is_published").order("sort_order").order("created_at", { ascending: false });
  return (
    <div className="max-w-2xl space-y-10">
      <PageHeader
        title="고객 후기 수정"
        actions={
          <Link href="/admin/testimonials" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            목록으로
          </Link>
        }
      />
      <TestimonialForm
        id={row.id}
        projects={projects ?? []}
        initial={{
          project_id: row.project_id,
          customer_label: row.customer_label,
          space_label: row.space_label,
          rating: row.rating,
          body: row.body,
          is_published: row.is_published,
          is_featured: row.is_featured,
          is_sample: row.is_sample,
          updated_at: row.updated_at,
        }}
      />
      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold">고객 후기 삭제</h2>
        <p className="mt-1 text-sm text-muted">삭제하면 되돌릴 수 없습니다. 잠시 숨기려면 위에서 "공개"를 해제하세요.</p>
        <form action={deleteTestimonial.bind(null, row.id)} className="mt-3">
          <ConfirmButton message="이 고객 후기을(를) 삭제할까요? 되돌릴 수 없습니다.">삭제</ConfirmButton>
        </form>
      </section>
    </div>
  );
}
