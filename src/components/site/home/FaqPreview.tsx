import Link from "next/link";
import type { Faq } from "@/lib/data/public";
import { FaqList } from "../FaqList";
import { Section } from "../Section";

export function FaqPreview({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;
  return (
    <Section eyebrow="FAQ" title="자주 묻는 질문" className="border-t border-line">
      <div className="max-w-3xl">
        <FaqList faqs={faqs} />
        <div className="mt-10">
          <Link href="/process#faq" className="border-b border-ink pb-1 text-sm font-medium hover:text-accent-ink">
            질문 더 보기
          </Link>
        </div>
      </div>
    </Section>
  );
}
