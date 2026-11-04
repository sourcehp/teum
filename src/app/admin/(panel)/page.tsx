import Link from "next/link";
import { InquiryTable } from "@/components/admin/InquiryTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { SampleWarning } from "@/components/admin/SampleWarning";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "대시보드" };

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const [newInq, recent, projects, sampleProjects, sampleTestimonials, company] = await Promise.all([
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase
      .from("inquiries")
      .select("id, name, space_type, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .eq("is_sample", true),
    supabase
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .eq("is_sample", true),
    supabase.from("site_settings").select("company_name, phone, address").eq("id", 1).maybeSingle(),
  ]);
  const c = company.data;
  const companyEmpty = !c || !c.company_name.trim() || !c.phone.trim() || !c.address.trim();
  const sampleCount = (sampleProjects.count ?? 0) + (sampleTestimonials.count ?? 0);

  return (
    <div>
      <PageHeader title="대시보드" />
      <SampleWarning count={sampleCount} />
      {companyEmpty ? (
        <p role="note" className="mb-6 border border-accent bg-accent/10 px-4 py-3 text-sm">
          회사 정보가 비어 있습니다 —{" "}
          <Link href="/admin/settings" className="font-medium text-accent-ink underline">
            사이트 설정
          </Link>
          에서 입력해 주세요
        </p>
      ) : null}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/inquiries?status=new" className="border border-line bg-surface p-5 hover:border-accent">
          <p className="text-sm text-muted">신규 문의</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{newInq.count ?? 0}건</p>
        </Link>
        <Link href="/admin/projects" className="border border-line bg-surface p-5 hover:border-accent">
          <p className="text-sm text-muted">공개 중인 시공 사례</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{projects.count ?? 0}개</p>
        </Link>
      </div>
      <h2 className="mb-3 font-semibold">최근 문의</h2>
      <InquiryTable rows={recent.data ?? []} empty="아직 접수된 문의가 없습니다" />
      <p className="mt-3 text-sm">
        <Link href="/admin/inquiries" className="text-accent-ink underline">
          전체 문의 보기
        </Link>
      </p>
    </div>
  );
}
