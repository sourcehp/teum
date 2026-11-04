import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { getPublicSettings } from "@/lib/data/public";

// 시행일. 운영 개시 전에 반드시 실제 날짜(예: "2026년 12월 1일")로 채운다. 비어 있으면 "(입력 필요)"로 표시된다.
const PRIVACY_EFFECTIVE_DATE = "";

export const revalidate = 3600;
export const metadata: Metadata = { title: "개인정보처리방침", alternates: { canonical: "/privacy" } };

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-8 first:border-t-0">
      <h2 className="mb-4 text-lg font-medium md:text-xl">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default async function PrivacyPage() {
  const s = await getPublicSettings();
  const company = s.company_name.trim() || "(입력 필요)";
  const ceo = s.ceo_name.trim() || "(입력 필요)";
  const phone = s.phone.trim() || "(입력 필요)";
  const email = s.email.trim() || "(입력 필요)";
  const effective = PRIVACY_EFFECTIVE_DATE.trim() || "(입력 필요)";
  const processors = [
    { name: "Supabase Inc.", task: "상담 문의 데이터베이스 및 파일 저장", where: "서버 소재지 대한민국(서울 리전), 운영사 미국", items: "문의 시 입력한 항목 전체", period: "위탁 계약 종료 또는 보유 기간 종료 시까지" },
    { name: "Resend, Inc.", task: "상담 접수 알림 메일 발송", where: "미국, 네트워크를 통한 전송", items: "이름, 연락처, 공간 유형", period: "발송 후 서비스 정책에 따른 기간" },
    { name: "Vercel Inc.", task: "웹사이트 호스팅 및 방문 통계", where: "미국 등, 네트워크를 통한 전송", items: "접속 기록(IP 주소, 브라우저 정보, 방문 페이지)", period: "서비스 정책에 따른 기간" },
  ];

  return (
    <>
      <PageHeader eyebrow="PRIVACY" title="개인정보처리방침">
        <p>{company}(이하 &lsquo;회사&rsquo;)는 상담 문의를 접수하기 위해 필요한 최소한의 개인정보만 수집하고, 아래 기준에 따라 처리합니다.</p>
      </PageHeader>
      <Container className="py-12 md:py-16">
        <div className="max-w-3xl">
          <Block title="1. 수집하는 개인정보 항목">
            <ul className="list-disc space-y-1 pl-5">
              <li>필수: 이름, 연락처, 공간 유형</li>
              <li>선택: 이메일, 지역, 평수, 예산 범위, 희망 시기, 문의 내용</li>
              <li>자동 수집: 유입 경로(광고 구분 값, 이전 페이지 주소, 처음 접속한 페이지), 접속 IP 주소를 변환한 해시 값(원문 미저장)</li>
            </ul>
          </Block>
          <Block title="2. 수집·이용 목적">
            <p>상담 문의에 대한 회신, 방문·실측 일정 협의, 견적 안내, 서비스 개선을 위한 통계 분석에 이용합니다.</p>
          </Block>
          <Block title="3. 보유 및 이용 기간">
            <p>상담이 완료된 날부터 1년간 보관한 뒤 파기합니다. 관계 법령에 따라 보관해야 하는 정보는 해당 기간 동안 보관합니다.</p>
          </Block>
          <Block title="4. 파기 절차와 방법">
            <p>보유 기간이 지난 개인정보는 지체 없이 복구할 수 없는 방법으로 삭제합니다. 정보주체가 삭제를 요청하는 경우에도 확인 후 즉시 삭제합니다.</p>
          </Block>
          <Block title="5. 동의를 거부할 권리">
            <p>개인정보 수집·이용에 동의하지 않을 수 있습니다. 다만 필수 항목에 동의하지 않으면 온라인 상담 접수가 제한되며, 전화로 문의하실 수 있습니다.</p>
          </Block>
                    <Block title="6. 개인정보 처리 위탁 및 국외 이전">
            <p>회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하며, 일부는 국외로 이전됩니다.</p>
            <ul className="space-y-4">
              {processors.map((p) => (
                <li key={p.name} className="border border-line bg-surface p-4">
                  <p className="font-medium text-ink">{p.name}</p>
                  <dl className="mt-2 space-y-2 text-sm">
                    {[["수탁자 위탁 업무", p.task], ["이전 국가·방식", p.where], ["이전 항목", p.items], ["보유 기간", p.period]].map(([k, v]) => (
                      <div key={k} className="grid gap-0.5 sm:grid-cols-[130px_1fr] sm:gap-4">
                        <dt className="text-muted">{k}</dt>
                        <dd className="break-words text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
            <p>이용자는 국외 이전을 거부할 수 있으나 이 경우 온라인 상담 접수가 어려우며, 전화로 상담하실 수 있습니다.</p>
          </Block>
          <Block title="7. 정보주체의 권리와 행사 방법">
            <p>이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 아래 문의처의 이메일 또는 전화로 요청해 주시면 지체 없이 조치합니다.</p>
          </Block>
          <Block title="8. 개인정보의 안전성 확보 조치">
            <ul className="list-disc space-y-1 pl-5">
              <li>접근 권한 관리: 개인정보를 열람할 수 있는 관리자 계정을 제한합니다.</li>
              <li>전송 구간 암호화: 모든 통신에 HTTPS를 사용합니다.</li>
              <li>IP 주소는 원문 대신 복원할 수 없는 해시 값으로 저장합니다.</li>
            </ul>
          </Block>
          <Block title="9. 개인정보 보호책임자 및 문의처">
            <dl className="border-t border-line">
              {[
                ["회사명", company],
                ["책임자", ceo],
                ["연락처", phone],
                ["이메일", email],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[120px_1fr] sm:gap-6">
                  <dt className="text-sm">{k}</dt>
                  <dd className="break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Block>
          <Block title="10. 시행일">
            <p>이 방침은 {effective}부터 시행합니다.</p>
          </Block>
        </div>
      </Container>
    </>
  );
}
