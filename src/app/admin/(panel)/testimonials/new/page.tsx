import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { EMPTY_TESTIMONIAL, TestimonialForm } from "@/components/admin/TestimonialForm";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "새 고객 후기" };

export default async function NewTestimonialPage() {
  const { supabase } = await requireAdmin();
  const { data: projects } = await supabase.from("projects").select("id, title, is_published").order("sort_order").order("created_at", { ascending: false });
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="새 고객 후기"
        actions={
          <Link href="/admin/testimonials" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            목록으로
          </Link>
        }
      />
      <TestimonialForm id={null} initial={EMPTY_TESTIMONIAL} projects={projects ?? []} />
    </div>
  );
}
