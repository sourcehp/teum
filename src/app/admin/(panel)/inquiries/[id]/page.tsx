import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { requireAdmin } from "@/lib/admin/auth";
import { CHANNEL_LABELS, classifyChannel } from "@/lib/domain/channel";
import { formatSeoulDateTime } from "@/lib/domain/datetime";
import { BUDGET_LABELS, CATEGORY_LABELS, type BudgetRange, type Category } from "@/lib/domain/labels";

export const metadata = { title: "문의 상세" };

const NOTIFY_LABELS: Record<string, string> = {
  pending: "알림 대기",
  sent: "알림 발송됨",
  failed: "알림 실패",
  skipped: "알림 건너뜀",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-line py-2.5 text-sm last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="col-span-2 whitespace-pre-wrap break-words">{children}</dd>
    </div>
  );
}

const dash = (v: string | number | null | undefined) => (v === null || v === undefined || v === "" ? "—" : v);

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { data: q } = await supabase.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (!q) notFound();

  const channel = classifyChannel(q);
  const channelLabel = CHANNEL_LABELS[channel] ?? channel;

  return (
    <div>
      <PageHeader
        title={q.name}
        description={`접수 ${formatSeoulDateTime(q.created_at)}`}
        actions={
          <Link href="/admin/inquiries" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            목록으로
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="border border-line bg-surface p-4">
            <h2 className="mb-2 font-semibold">문의 내용</h2>
            <dl>
              <Row label="이름">{q.name}</Row>
              <Row label="연락처">
                <a href={`tel:${q.phone.replace(/[^0-9+]/g, "")}`} className="text-accent-ink underline">
                  {q.phone}
                </a>
              </Row>
              <Row label="이메일">{dash(q.email)}</Row>
              <Row label="공간 유형">{CATEGORY_LABELS[q.space_type as Category] ?? q.space_type}</Row>
              <Row label="지역">{dash(q.region)}</Row>
              <Row label="평수">{q.area_pyeong === null ? "—" : `${q.area_pyeong}평`}</Row>
              <Row label="예산">
                {q.budget_range ? (BUDGET_LABELS[q.budget_range as BudgetRange] ?? q.budget_range) : "—"}
              </Row>
              <Row label="착공 시기">{dash(q.desired_start)}</Row>
              <Row label="내용">{dash(q.message)}</Row>
            </dl>
          </section>
          <section className="border border-line bg-surface p-4">
            <h2 className="mb-2 font-semibold">유입 정보</h2>
            <dl>
              <Row label="유입 채널">{channelLabel}</Row>
              <Row label="UTM 출처">{dash(q.utm_source)}</Row>
              <Row label="UTM 매체">{dash(q.utm_medium)}</Row>
              <Row label="UTM 캠페인">{dash(q.utm_campaign)}</Row>
              <Row label="이전 페이지">{dash(q.referrer)}</Row>
              <Row label="첫 방문 경로">{dash(q.landing_path)}</Row>
              <Row label="알림 상태">{NOTIFY_LABELS[q.notify_status] ?? q.notify_status}</Row>
              <Row label="개인정보 동의">{formatSeoulDateTime(q.privacy_agreed_at)}</Row>
            </dl>
          </section>
        </div>
        <section className="h-fit border border-line bg-surface p-4">
          <h2 className="mb-4 font-semibold">상담 처리</h2>
          <StatusSelect id={q.id} status={q.status} memo={q.admin_memo ?? ""} />
        </section>
      </div>
    </div>
  );
}
