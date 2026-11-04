import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatSeoulDateTime } from "@/lib/domain/datetime";
import { CATEGORY_LABELS, type Category } from "@/lib/domain/labels";

export type InquiryRow = { id: string; name: string; space_type: string; created_at: string; status: string };

export function InquiryTable({ rows, empty = "문의가 없습니다" }: { rows: InquiryRow[]; empty?: string }) {
  if (rows.length === 0) {
    return <p className="border border-line bg-surface px-4 py-8 text-center text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">이름</th>
            <th scope="col" className="px-4 py-2.5 font-medium">공간 유형</th>
            <th scope="col" className="px-4 py-2.5 font-medium">접수 시각</th>
            <th scope="col" className="px-4 py-2.5 font-medium">상태</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="relative border-b border-line last:border-b-0 hover:bg-bg">
              <td className="px-4 py-3 font-medium">
                <Link
                  href={`/admin/inquiries/${r.id}`}
                  className="after:absolute after:inset-0 after:content-['']"
                >
                  {r.name}
                </Link>
              </td>
              <td className="px-4 py-3">{CATEGORY_LABELS[r.space_type as Category] ?? r.space_type}</td>
              <td className="whitespace-nowrap px-4 py-3 tabular-nums">{formatSeoulDateTime(r.created_at)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
