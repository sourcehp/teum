import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { BannerForm } from "@/components/admin/BannerForm";
import { todayInSeoul } from "@/lib/domain/banner";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "새 이벤트 배너" };

export default async function NewBannerPage() {
  await requireAdmin();
  const today = todayInSeoul(new Date());
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="새 이벤트 배너"
        actions={
          <Link href="/admin/banners" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            목록으로
          </Link>
        }
      />
      <BannerForm id={null} initial={{ message: "", link_url: null, starts_on: today, ends_on: today, is_active: true }} />
    </div>
  );
}
