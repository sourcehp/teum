import type { Testimonial } from "@/lib/data/public";
import { Section } from "../Section";
import { TestimonialCard } from "../TestimonialCard";

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <Section eyebrow="REVIEWS" title="함께한 분들의 이야기" className="border-t border-line">
      <div className="grid gap-6 md:grid-cols-3">
        {items.slice(0, 3).map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </div>
    </Section>
  );
}
