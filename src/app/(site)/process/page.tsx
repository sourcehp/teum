import type { Metadata } from "next";
import { Button } from "@/components/site/Button";
import { FaqList } from "@/components/site/FaqList";
import { PageHeader } from "@/components/site/PageHeader";
import { Section } from "@/components/site/Section";
import { getFaqs } from "@/lib/data/public";
import { PROCESS_STEPS } from "@/lib/process-steps";

export const revalidate = 3600;
export const metadata: Metadata = { title: "진행 절차" };

export default async function ProcessPage() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHeader eyebrow="PROCESS" title="상담에서 사후관리까지, 여섯 단계">
        <p>처음 상담부터 준공 후 하자 보수까지, 각 단계에서 무엇을 하는지 미리 알려 드립니다.</p>
      </PageHeader>

      <Section>
        <ol className="max-w-3xl">
          {PROCESS_STEPS.map((s, i) => (
            <li key={s.no} className="relative grid grid-cols-[3rem_1fr] gap-x-5 pb-10 last:pb-0 md:grid-cols-[4rem_1fr] md:gap-x-8 md:pb-14">
              {i < PROCESS_STEPS.length - 1 ? (
                <span aria-hidden="true" className="absolute bottom-0 left-6 top-12 w-px bg-line md:left-8 md:top-16" />
              ) : null}
              <span className="flex size-12 items-center justify-center rounded-full border border-accent bg-bg text-sm tracking-widest text-accent-ink md:size-16 md:text-base">
                {String(s.no).padStart(2, "0")}
              </span>
              <div className="pt-2 md:pt-4">
                <h2 className="text-xl font-medium md:text-2xl">{s.title}</h2>
                <p className="mt-2 leading-relaxed text-muted">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {faqs.length > 0 ? (
        <Section id="faq" eyebrow="FAQ" title="자주 묻는 질문" className="scroll-mt-16 border-t border-line">
          <div className="max-w-3xl">
            <FaqList faqs={faqs} />
          </div>
        </Section>
      ) : null}

      <Section className="border-t border-line">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-2xl font-semibold leading-snug md:text-3xl">공간 이야기를 들려 주세요.</p>
          <Button href="/contact">무료 상담 신청</Button>
        </div>
      </Section>
    </>
  );
}
