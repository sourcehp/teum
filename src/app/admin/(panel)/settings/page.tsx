import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm, type SettingsValues } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/admin/auth";
import { SAMPLE_GUARANTEES, SAMPLE_STATS, sameRows } from "@/lib/admin/sample-settings";
import { asRecords } from "@/components/site/home/json";

export const metadata = { title: "사이트 설정" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data: row, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  if (error || !row) {
    return (
      <div className="max-w-3xl">
        <PageHeader title="사이트 설정" />
        <p role="alert" className="border border-red-700 bg-surface p-4 text-sm text-red-700">
          설정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const stats = asRecords(row.stats);
  const guarantees = asRecords(row.guarantees);
  const initial: SettingsValues = { ...row, stats, guarantees, partners: asRecords(row.partners), visual_works: asRecords(row.visual_works) };

  return (
    <div className="max-w-3xl">
      <PageHeader title="사이트 설정" description="회사 정보와 홈페이지 문구를 한 곳에서 관리합니다. 저장하면 바로 홈페이지에 반영됩니다." />
      <SettingsForm initial={initial} sampleStats={sameRows(stats, SAMPLE_STATS)} sampleGuarantees={sameRows(guarantees, SAMPLE_GUARANTEES)} />
    </div>
  );
}
