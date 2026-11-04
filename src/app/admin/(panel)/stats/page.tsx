import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { channelLabel } from "@/lib/domain/channel";
import { INQUIRY_STATUSES, STATUS_LABELS, type InquiryStatus } from "@/lib/domain/labels";
import { aggregateByChannel } from "@/lib/domain/stats";

export const metadata = { title: "유입 통계" };

const CHUNK = 1000;

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const range = (Array.isArray(sp.range) ? sp.range[0] : sp.range) === "90" ? 90 : 30;
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

  const all: { utm_source: string | null; referrer: string | null; status: InquiryStatus; created_at: string }[] = [];
  let failed = false;
  for (let from = 0; ; from += CHUNK) {
    const { data, error } = await supabase
      .from("inquiries")
      .select("utm_source, referrer, status, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + CHUNK - 1);
    if (error) {
      failed = true;
      break;
    }
    all.push(...(data as typeof all));
    if (data.length < CHUNK) break;
  }
  const stats = aggregateByChannel(all, since);

  return (
    <div>
      <PageHeader title="유입 통계" description={`최근 ${range}일 동안 접수된 문의를 유입 채널별로 나눈 표입니다.`} />
      <nav aria-label="기간" className="mb-4 flex gap-2">
        {[30, 90].map((d) => (
          <Link
            key={d}
            href={d === 30 ? "/admin/stats" : `/admin/stats?range=${d}`}
            aria-current={d === range ? "page" : undefined}
            className={`border px-3 py-1.5 text-sm ${
              d === range ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-accent"
            }`}
          >
            최근 {d}일
          </Link>
        ))}
      </nav>
      {failed ? (
        <p role="alert" className="text-sm text-red-700">
          통계를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : stats.length === 0 ? (
        <p className="border border-line bg-surface px-4 py-8 text-center text-sm text-muted">
          이 기간에 접수된 문의가 없습니다
        </p>
      ) : (
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">채널</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">총 문의</th>
                {INQUIRY_STATUSES.map((s) => (
                  <th key={s} scope="col" className="px-4 py-2.5 text-right font-medium">
                    {STATUS_LABELS[s]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((r) => (
                <tr key={r.channel} className="border-b border-line last:border-b-0">
                  <th scope="row" className="px-4 py-3 font-medium">
                    {channelLabel(r.channel)}
                  </th>
                  <td className="px-4 py-3 text-right tabular-nums">{r.total}</td>
                  {INQUIRY_STATUSES.map((s) => (
                    <td key={s} className="px-4 py-3 text-right tabular-nums">
                      {r.byStatus[s]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
