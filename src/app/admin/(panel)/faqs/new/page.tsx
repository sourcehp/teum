import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { EMPTY_FAQ, FaqForm } from "@/components/admin/FaqForm";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "새 FAQ" };

export default async function NewFaqPage() {
  await requireAdmin();
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="새 FAQ"
        actions={
          <Link href="/admin/faqs" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            목록으로
          </Link>
        }
      />
      <FaqForm id={null} initial={EMPTY_FAQ} />
    </div>
  );
}
