import { requireAdmin } from "@/lib/admin/auth";
import { parseStatus } from "@/lib/admin/inquiry-query";
import { channelLabel, classifyChannel } from "@/lib/domain/channel";
import { escapeCsvFormula, toCsv } from "@/lib/domain/csv";
import { formatSeoulDateTime, seoulDateStamp } from "@/lib/domain/datetime";
import { BUDGET_LABELS, CATEGORY_LABELS, STATUS_LABELS, type BudgetRange, type Category, type InquiryStatus } from "@/lib/domain/labels";

export const dynamic = "force-dynamic";

const HEADERS = ["접수일시", "이름", "연락처", "이메일", "공간 유형", "지역", "평수", "예산", "희망 시기", "내용", "상태", "메모", "유입 채널"];
const CHUNK = 1000;

export async function GET(request: Request): Promise<Response> {
  const { supabase } = await requireAdmin();
  const status = parseStatus(new URL(request.url).searchParams.get("status") ?? undefined);

  const rows: (string | number | null)[][] = [];
  for (let from = 0; ; from += CHUNK) {
    let q = supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + CHUNK - 1);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return new Response("내보내기에 실패했습니다", { status: 500 });
    for (const r of data) {
      const channel = classifyChannel(r);
      const t = (v: string | null) => escapeCsvFormula(v ?? "");
      rows.push([
        formatSeoulDateTime(r.created_at),
        t(r.name),
        r.phone,
        t(r.email),
        CATEGORY_LABELS[r.space_type as Category] ?? r.space_type,
        t(r.region),
        r.area_pyeong,
        r.budget_range ? (BUDGET_LABELS[r.budget_range as BudgetRange] ?? r.budget_range) : "",
        t(r.desired_start),
        t(r.message),
        STATUS_LABELS[r.status as InquiryStatus] ?? r.status,
        t(r.admin_memo),
        escapeCsvFormula(channelLabel(channel)),
      ]);
    }
    if (data.length < CHUNK) break;
  }

  return new Response(toCsv(HEADERS, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${seoulDateStamp(new Date())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
