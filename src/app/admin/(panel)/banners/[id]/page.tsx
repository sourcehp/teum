import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { BannerForm } from "@/components/admin/BannerForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteBanner } from "../actions";

export const metadata = { title: "이벤트 배너 수정" };

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data: row } = await supabase.from("banners").select("*").eq("id", id).maybeSingle();
  if (!row) notFound();

  return (
    <div className="max-w-2xl space-y-10">
      <PageHeader
        title="이벤트 배너 수정"
        actions={
          <Link href="/admin/banners" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            목록으로
          </Link>
        }
      />
      <BannerForm id={row.id} initial={{ message: row.message, link_url: row.link_url, starts_on: row.starts_on, ends_on: row.ends_on, is_active: row.is_active, updated_at: row.updated_at }} />
      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold">이벤트 배너 삭제</h2>
        <p className="mt-1 text-sm text-muted">삭제하면 되돌릴 수 없습니다. 잠시 내리려면 위에서 "사용"을 해제하세요.</p>
        <form action={deleteBanner.bind(null, row.id)} className="mt-3">
          <ConfirmButton message="이 이벤트 배너을(를) 삭제할까요? 되돌릴 수 없습니다.">삭제</ConfirmButton>
        </form>
      </section>
    </div>
  );
}
