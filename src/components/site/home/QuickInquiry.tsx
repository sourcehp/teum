import { Container } from "../Container";
import { InquiryFlow } from "../inquiry/InquiryFlow";

export function QuickInquiry({ phone }: { phone: string }) {
  return (
    <section id="quick-inquiry" className="scroll-mt-24 border-t border-line bg-surface py-20 md:py-28">
      <Container className="grid gap-12 md:grid-cols-[1fr_1fr] md:gap-20">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-accent-ink">CONSULTATION</p>
          <h2 className="text-2xl font-semibold leading-snug tracking-tight md:text-4xl">
            이름과 연락처만 남겨 주세요.
            <br />
            먼저 연락드립니다.
          </h2>
          <p className="mt-6 leading-relaxed text-muted">
            상담은 무료이며, 접수 후 영업일 기준 1일 안에 연락드립니다.
            {phone ? ` 급하시면 ${phone}로 전화 주세요.` : ""}
          </p>
        </div>
        <InquiryFlow variant="quick" />
      </Container>
    </section>
  );
}
