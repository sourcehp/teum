import type { Testimonial } from "@/lib/data/public";
import { Section } from "../Section";
import { TestimonialCard } from "../TestimonialCard";

export function Testimonials({ items, title }: { items: Testimonial[]; title: string }) {
  if (items.length === 0) return null;
  return (
    <Section eyebrow="REVIEWS" title={title} className="border-t border-line">
      <div className="grid gap-6 md:grid-cols-3">
        {items.slice(0, 3).map((t) => (
          <TestimonialCard key={t.id} t={t} />
        ))}
      </div>
    </Section>
  );
}
