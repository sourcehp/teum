import type { Faq } from "@/lib/data/public";

export function FaqList({ faqs }: { faqs: Pick<Faq, "id" | "question" | "answer">[] }) {
  return (
    <div className="border-t border-line">
      {faqs.map((f) => (
        <details key={f.id} className="group border-b border-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-base font-medium md:text-lg [&::-webkit-details-marker]:hidden">
            <span>{f.question}</span>
            <span aria-hidden="true" className="text-xl text-accent-ink transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="whitespace-pre-line pb-6 pr-10 leading-relaxed text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
