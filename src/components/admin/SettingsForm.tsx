"use client";

import { saveSettings } from "@/app/admin/(panel)/settings/actions";
import { FormField } from "@/components/admin/FormField";
import { FormShell, inputCls } from "@/components/admin/FormShell";
import { JsonListEditor } from "@/components/admin/JsonListEditor";
import { SingleImageField } from "@/components/admin/SingleImageField";

export type SettingsValues = {
  company_name: string;
  ceo_name: string;
  business_number: string;
  address: string;
  phone: string;
  email: string;
  hero_title: string;
  hero_subtitle: string;
  benefit_text: string;
  philosophy_text: string;
  ceo_greeting: string;
  instagram_url: string;
  blog_url: string;
  kakao_channel_url: string;
  notify_email: string;
  ga4_id: string;
  naver_site_verification: string;
  google_site_verification: string;
  logo_path: string | null;
  hero_image_path: string | null;
  ceo_image_path: string | null;
  stats: Record<string, unknown>[];
  guarantees: Record<string, unknown>[];
  partners: Record<string, unknown>[];
  updated_at: string;
};

function Section({ title, help, children }: { title: string; help: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 border border-line bg-surface/50 p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{help}</p>
      </div>
      {children}
    </section>
  );
}

function Area({ label, name, value, rows, max, hint, error }: { label: string; name: string; value: string; rows: number; max: number; hint: string; error?: string }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="block text-sm font-medium">
        {label}
      </label>
      <textarea id={`f-${name}`} name={name} rows={rows} maxLength={max} defaultValue={value} className={inputCls} />
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function SettingsForm({
  initial,
  sampleStats,
  sampleGuarantees,
}: {
  initial: SettingsValues;
  sampleStats: boolean;
  sampleGuarantees: boolean;
}) {
  const v = initial;
  return (
    <FormShell action={saveSettings} submitLabel="설정 저장" resetKey={v.updated_at}>
      {(fe, markDirty) => (
        <div className="space-y-8">
          <Section title="회사 정보" help="푸터(화면 맨 아래)와 문의 페이지에 표시됩니다.">
            <SingleImageField label="로고" name="logo_path" folder="settings" initialPath={v.logo_path} onChange={markDirty} hint="화면 맨 위 메뉴 왼쪽에 보입니다. 비워 두면 회사명이 글자로 보입니다." />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="회사명" name="company_name" maxLength={200} defaultValue={v.company_name} error={fe.company_name} hint="메뉴, 푸터, 검색 결과에 표시됩니다" />
              <FormField label="대표자명" name="ceo_name" maxLength={200} defaultValue={v.ceo_name} error={fe.ceo_name} />
              <FormField label="사업자등록번호" name="business_number" maxLength={200} defaultValue={v.business_number} error={fe.business_number} />
              <FormField label="대표 전화번호" name="phone" maxLength={200} defaultValue={v.phone} error={fe.phone} hint="하이픈 없이 입력해도 됩니다. 모바일 하단의 전화 버튼에도 쓰입니다" inputMode="tel" />
              <FormField label="대표 이메일" name="email" type="email" maxLength={200} defaultValue={v.email} error={fe.email} />
              <FormField label="주소" name="address" maxLength={200} defaultValue={v.address} error={fe.address} />
            </div>
          </Section>

          <Section title="홈 화면" help="홈페이지 맨 위 큰 화면(히어로)에 표시됩니다.">
            <FormField label="메인 문구" name="hero_title" maxLength={200} defaultValue={v.hero_title} error={fe.hero_title} />
            <FormField label="보조 문구" name="hero_subtitle" maxLength={200} defaultValue={v.hero_subtitle} error={fe.hero_subtitle} />
            <FormField label="혜택 문구" name="benefit_text" maxLength={200} defaultValue={v.benefit_text} error={fe.benefit_text} hint="메인 문구 아래에 작게 보이는 한 줄 안내입니다" />
            <SingleImageField label="히어로 사진" name="hero_image_path" folder="settings" initialPath={v.hero_image_path} onChange={markDirty} hint="비워 두면 대표 시공 사례 사진이 대신 보입니다." />
          </Section>

          <Section title="소개" help="회사 소개 페이지에 표시됩니다.">
            <Area label="디자인 철학" name="philosophy_text" value={v.philosophy_text} rows={5} max={3000} hint="3,000자까지 쓸 수 있습니다" error={fe.philosophy_text} />
            <Area label="대표 인사말" name="ceo_greeting" value={v.ceo_greeting} rows={6} max={3000} hint="3,000자까지 쓸 수 있습니다" error={fe.ceo_greeting} />
            <SingleImageField label="대표 사진" name="ceo_image_path" folder="settings" initialPath={v.ceo_image_path} onChange={markDirty} hint="인사말 옆에 보입니다. 비워 두면 사진 없이 표시됩니다." />
          </Section>

          <Section title="실적 · 보증 · 파트너" help="홈페이지 중간의 실적 숫자, 보증 약속, 언론·파트너 로고에 표시됩니다.">
            <div>
              <h3 className="mb-2 text-sm font-semibold">실적 숫자 (최대 6개)</h3>
              <JsonListEditor
                name="stats"
                itemLabel="실적"
                addLabel="실적 추가"
                max={6}
                initial={v.stats}
                sampleNotice={sampleStats}
                error={fe.stats}
                onDirty={markDirty}
                fields={[
                  { key: "label", label: "이름 (20자 이내)", maxLength: 20, placeholder: "누적 시공 사례" },
                  { key: "value", label: "숫자 (10자 이내)", maxLength: 10, placeholder: "120" },
                  { key: "suffix", label: "단위 (5자 이내)", maxLength: 5, placeholder: "건" },
                ]}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">보증 약속 (최대 6개)</h3>
              <JsonListEditor
                name="guarantees"
                itemLabel="보증"
                addLabel="보증 추가"
                max={6}
                initial={v.guarantees}
                sampleNotice={sampleGuarantees}
                error={fe.guarantees}
                onDirty={markDirty}
                fields={[
                  { key: "title", label: "제목 (30자 이내)", maxLength: 30 },
                  { key: "description", label: "설명 (100자 이내)", maxLength: 100 },
                ]}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">언론 · 파트너 (최대 20개)</h3>
              <JsonListEditor
                name="partners"
                itemLabel="파트너"
                addLabel="파트너 추가"
                max={20}
                initial={v.partners}
                error={fe.partners}
                onDirty={markDirty}
                fields={[
                  { key: "name", label: "이름 (40자 이내)", maxLength: 40 },
                  { key: "url", label: "링크 (https:// 로 시작, 선택)", maxLength: 500, placeholder: "https://" },
                  { key: "logo_path", label: "로고", kind: "image", folder: "partners" },
                ]}
              />
            </div>
          </Section>

          <Section title="연락 채널" help="푸터와 문의 페이지의 SNS 링크, 화면 오른쪽 아래 카카오톡 버튼에 쓰입니다. https:// 로 시작하는 주소만 쓸 수 있고, 비워 두면 표시되지 않습니다.">
            <FormField label="인스타그램 주소" name="instagram_url" maxLength={500} defaultValue={v.instagram_url} error={fe.instagram_url} placeholder="https://www.instagram.com/..." />
            <FormField label="블로그 주소" name="blog_url" maxLength={500} defaultValue={v.blog_url} error={fe.blog_url} placeholder="https://blog.naver.com/..." />
            <FormField label="카카오톡 채널 주소" name="kakao_channel_url" maxLength={500} defaultValue={v.kakao_channel_url} error={fe.kakao_channel_url} placeholder="https://pf.kakao.com/..." />
          </Section>

          <Section title="알림 · 분석 · 검색 등록" help="방문자에게 보이지 않는 설정입니다. 잘 모르면 비워 두어도 됩니다.">
            <FormField label="문의 알림 받을 이메일" name="notify_email" type="email" maxLength={200} defaultValue={v.notify_email} error={fe.notify_email} hint="새 문의가 접수되면 이 주소로 알림 메일을 보냅니다" />
            <FormField label="Google 애널리스틱스 측정 ID" name="ga4_id" maxLength={50} defaultValue={v.ga4_id} error={fe.ga4_id} hint="G- 로 시작합니다 (예: G-ABC123XYZ). 방문 통계를 보려면 입력하세요" />
            <FormField label="네이버 서치어드바이저 인증 값" name="naver_site_verification" maxLength={100} defaultValue={v.naver_site_verification} error={fe.naver_site_verification} hint="네이버 검색에 사이트를 등록할 때 받은 인증 코드(content 값)" />
            <FormField label="구글 서치콘솔 인증 값" name="google_site_verification" maxLength={100} defaultValue={v.google_site_verification} error={fe.google_site_verification} hint="구글 검색에 사이트를 등록할 때 받은 인증 코드(content 값)" />
          </Section>
        </div>
      )}
    </FormShell>
  );
}
