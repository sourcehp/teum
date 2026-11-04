import type { Testimonial } from "@/lib/data/public";
import { Section } from "../Section";

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <Section eyebrow="REVIEWS" title="함께한 분들의 이야기" className="border-t border-line">
      <div className="grid gap-6 md:grid-cols-3">
        {items.slice(0, 3).map((t) => (
          <figure key={t.id} className="flex flex-col bg-surface p-7">
            <p className="text-accent" aria-label={`별점 ${t.rating}점`}>
              {"★".repeat(t.rating)}
              <span className="text-line">{"★".repeat(5 - t.rating)}</span>
            </p>
            <blockquote className="mt-4 flex-1 leading-relaxed">{t.body}</blockquote>
            <figcaption className="mt-6 border-t border-line pt-4 text-sm text-muted">
              {t.customer_label}
              {t.space_label ? ` · ${t.space_label}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
