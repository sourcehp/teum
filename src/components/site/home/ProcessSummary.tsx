import Link from "next/link";
import { PROCESS_STEPS } from "@/lib/process-steps";
import { Section } from "../Section";

export function ProcessSummary() {
  return (
    <Section eyebrow="PROCESS" title="상담에서 사후관리까지, 여섯 단계" className="border-t border-line">
      <ol className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {PROCESS_STEPS.map((s) => (
          <li key={s.no} className="border-b border-r border-line p-6 md:p-8">
            <p className="text-xs tracking-[0.2em] text-accent-ink">{String(s.no).padStart(2, "0")}</p>
            <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <Link href="/process" className="border-b border-ink pb-1 text-sm font-medium hover:text-accent-ink">
          진행 절차 자세히 보기
        </Link>
      </div>
    </Section>
  );
}
