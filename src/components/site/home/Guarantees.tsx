import { Section } from "../Section";
import { asRecords, text } from "./json";

export function Guarantees({ guarantees }: { guarantees: unknown }) {
  const items = asRecords(guarantees)
    .map((g) => ({ title: text(g.title), description: text(g.description) }))
    .filter((g) => g.title);
  if (items.length === 0) return null;
  return (
    <Section eyebrow="OUR PROMISE" title="틈 없이 지키는 약속" className="border-t border-line">
      <ul className="grid gap-px border border-line bg-line md:grid-cols-3">
        {items.map((g, i) => (
          <li key={g.title} className="bg-bg p-7 md:p-9">
            <p className="text-xs tracking-[0.2em] text-accent-ink">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-4 text-lg font-medium">{g.title}</h3>
            {g.description ? <p className="mt-2 leading-relaxed text-muted">{g.description}</p> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
