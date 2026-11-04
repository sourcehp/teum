import { Container } from "../Container";
import { CountUp } from "../CountUp";
import { asRecords, text } from "./json";

export function Stats({ stats }: { stats: unknown }) {
  const items = asRecords(stats)
    .map((s) => ({ label: text(s.label), value: text(s.value), suffix: text(s.suffix) }))
    .filter((s) => s.label && s.value);
  if (items.length === 0) return null;
  return (
    <section aria-label="실적" className="border-y border-line py-12 md:py-16">
      <Container>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {items.map((s) => (
            <div key={s.label}>
              <dd className="order-1 flex items-baseline gap-1.5">
                <CountUp value={s.value} className="text-4xl font-semibold tracking-tight tabular-nums md:text-5xl" />
                {s.suffix ? <span className="text-sm text-muted md:text-base">{s.suffix}</span> : null}
              </dd>
              <dt className="mt-2 text-sm text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
