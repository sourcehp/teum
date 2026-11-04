import type { Testimonial } from "@/lib/data/public";

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex flex-col bg-surface p-7">
      <p className="text-accent">
        <span aria-hidden="true">
          {"★".repeat(t.rating)}
          <span className="text-line">{"★".repeat(5 - t.rating)}</span>
        </span>
        <span className="sr-only">별점 {t.rating}점</span>
      </p>
      <blockquote className="mt-4 flex-1 leading-relaxed">{t.body}</blockquote>
      <figcaption className="mt-6 border-t border-line pt-4 text-sm text-muted">
        {t.customer_label}
        {t.space_label ? ` · ${t.space_label}` : ""}
      </figcaption>
    </figure>
  );
}
