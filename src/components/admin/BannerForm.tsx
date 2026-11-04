"use client";

import { saveBanner } from "@/app/admin/(panel)/banners/actions";
import { FormField } from "@/components/admin/FormField";
import { FormShell } from "@/components/admin/FormShell";

export type BannerFormValues = {
  message: string;
  link_url: string | null;
  starts_on: string;
  ends_on: string;
  is_active: boolean;
  updated_at?: string;
};

export function BannerForm({ id, initial }: { id: string | null; initial: BannerFormValues }) {
  return (
    <FormShell action={saveBanner.bind(null, id)} submitLabel={id ? "저장" : "배너 만들기"} resetKey={initial.updated_at ?? "new"}>
      {(fe) => (
        <>
          <FormField label="배너 문구" name="message" required maxLength={80} defaultValue={initial.message} error={fe.message} hint="홈페이지 맨 위에 보이는 한 줄 문구 (80자 이내)" />
          <FormField label="연결 링크" name="link_url" maxLength={500} defaultValue={initial.link_url ?? ""} error={fe.link_url} hint="비워 두면 링크 없이 문구만 보입니다. /contact 처럼 사이트 안 주소나 https:// 주소만 쓸 수 있습니다" />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="시작일" name="starts_on" type="date" required defaultValue={initial.starts_on} error={fe.starts_on} />
            <FormField label="종료일" name="ends_on" type="date" required defaultValue={initial.ends_on} error={fe.ends_on} hint="종료일 당일까지 보입니다 (한국 시간 기준)" />
          </div>
          <label className="flex items-center gap-2 border border-line bg-surface p-4 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={initial.is_active} />
            사용 (끄면 기간 중에도 보이지 않습니다)
          </label>
        </>
      )}
    </FormShell>
  );
}
