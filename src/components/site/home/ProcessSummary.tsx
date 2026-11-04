import Link from "next/link";
import { Section } from "../Section";
import { asRecords, text } from "./json";

export function ProcessSummary({ title, steps }: { title: string; steps: unknown }) {
  const items = asRecords(steps)
    .map((s) => ({ title: text(s.title), description: text(s.description) }))
    .filter((s) => s.title);
  if (items.length === 0) return null;
  return (
    <Section eyebrow="PROCESS" title={title} className="border-t border-line">
      <ol className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s, i) => (
          <li key={`${s.title}-${i}`} className="border-b border-r border-line p-6 md:p-8">
            <p className="text-xs tracking-[0.2em] text-accent-ink">{String(i + 1).padStart(2, "0")}</p>
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
