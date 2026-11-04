import Link from "next/link";
import { InquiryTable } from "@/components/admin/InquiryTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { INQUIRY_PAGE_SIZE, parsePage, parseStatus } from "@/lib/admin/inquiry-query";
import { INQUIRY_STATUSES, STATUS_LABELS } from "@/lib/domain/labels";

export const metadata = { title: "상담 문의" };

type SP = Promise<{ [k: string]: string | string[] | undefined }>;

function href(status: string | null, page: number): string {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/admin/inquiries?${s}` : "/admin/inquiries";
}

export default async function InquiriesPage({ searchParams }: { searchParams: SP }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = parseStatus(sp.status);
  const page = parsePage(sp.page);
  const from = (page - 1) * INQUIRY_PAGE_SIZE;

  let query = supabase
    .from("inquiries")
    .select("id, name, space_type, created_at, status", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + INQUIRY_PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  const { data, count, error } = await query;
  const total = count ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / INQUIRY_PAGE_SIZE));
  const exportHref = status ? `/admin/inquiries/export?status=${status}` : "/admin/inquiries/export";

  const tabs: { key: string | null; label: string }[] = [
    { key: null, label: "전체" },
    ...INQUIRY_STATUSES.map((s) => ({ key: s as string, label: STATUS_LABELS[s] })),
  ];

  return (
    <div>
      <PageHeader
        title="상담 문의"
        description={`${status ? STATUS_LABELS[status] : "전체"} ${total.toLocaleString("ko-KR")}건`}
        actions={
          <a href={exportHref} className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            CSV 내려받기
          </a>
        }
      />
      <nav aria-label="상태 필터" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.key === status;
          return (
            <Link
              key={t.label}
              href={href(t.key, 1)}
              aria-current={active ? "page" : undefined}
              className={`border px-3 py-1.5 text-sm ${
                active ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-accent"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {error ? (
        <p role="alert" className="text-sm text-red-700">
          문의를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : (
        <InquiryTable rows={data ?? []} empty="해당하는 문의가 없습니다" />
      )}
      {lastPage > 1 ? (
        <nav aria-label="페이지" className="mt-4 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? <Link href={href(status, page - 1)}>이전</Link> : <span className="text-muted">이전</span>}
          <span className="tabular-nums">
            {page} / {lastPage}
          </span>
          {page < lastPage ? <Link href={href(status, page + 1)}>다음</Link> : <span className="text-muted">다음</span>}
        </nav>
      ) : null}
    </div>
  );
}
