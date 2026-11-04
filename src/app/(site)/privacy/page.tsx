import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { getPublicSettings } from "@/lib/data/public";

export const revalidate = 3600;
export const metadata: Metadata = { title: "개인정보처리방침" };

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

  return (
    <>
      <PageHeader eyebrow="PRIVACY" title="개인정보처리방침">
        <p>{company}(이하 &lsquo;회사&rsquo;)은 상담 문의를 접수하기 위해 필요한 최소한의 개인정보만 수집하고, 아래 기준에 따라 처리합니다.</p>
      </PageHeader>
      <Container className="py-12 md:py-16">
        <div className="max-w-3xl">
          <Block title="1. 수집하는 개인정보 항목">
            <ul className="list-disc space-y-1 pl-5">
              <li>필수: 이름, 연락처, 공간 유형</li>
              <li>선택: 이메일, 지역, 평수, 예산 범위, 희망 시기, 문의 내용</li>
              <li>자동 수집: 유입 경로(광고 구분 값, 이전 페이지 주소, 처음 접속한 페이지), 중복 접수 방지를 위해 변환한 접속 정보 값</li>
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
          <Block title="6. 개인정보 보호책임자 및 문의처">
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
        </div>
      </Container>
    </>
  );
}
