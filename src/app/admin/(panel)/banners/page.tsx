import Link from "next/link";
import { EntityList, type EntityBadge, type EntityRow } from "@/components/admin/EntityList";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { bannerStatus, type BannerStatus } from "@/lib/domain/banner";

export const metadata = { title: "이벤트 배너" };

const TONE: Record<BannerStatus, EntityBadge["tone"]> = { "노출 중": "on", 예약: "warn", 종료: "off", 꺼짐: "off" };

export default async function BannersPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("banners")
    .select("id, message, link_url, starts_on, ends_on, is_active")
    .order("starts_on", { ascending: false })
    .order("created_at", { ascending: false });
  const now = new Date();
  const rows: EntityRow[] = (data ?? []).map((b) => {
    const status = bannerStatus(b, now);
    return {
      id: b.id,
      title: b.message,
      subtitle: `${b.starts_on} ~ ${b.ends_on}${b.link_url ? `  →  ${b.link_url}` : ""}`,
      badges: [{ text: status, tone: TONE[status] }],
    };
  });

  return (
    <div>
      <PageHeader
        title="이벤트 배너"
        description="홈페이지 맨 위에 보이는 한 줄 안내입니다. 기간 중 사용 중인 배너가 여러 개면 시작일이 가장 늦은 하나만 보입니다."
        actions={
          <Link href="/admin/banners/new" className="bg-ink px-4 py-2 text-sm font-medium text-bg hover:bg-accent-ink">
            새 배너 추가
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p className="border border-line bg-surface p-6 text-center text-sm text-muted">
          아직 등록된 배너가 없습니다. &quot;새 배너 추가&quot;를 눌러 만들어 보세요.
        </p>
      ) : (
        <EntityList rows={rows} basePath="/admin/banners" />
      )}
    </div>
  );
}
