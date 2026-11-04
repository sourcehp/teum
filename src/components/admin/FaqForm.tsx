"use client";

import { saveFaq } from "@/app/admin/(panel)/faqs/actions";
import { FormShell, inputCls } from "@/components/admin/FormShell";

export type FaqFormValues = { question: string; answer: string; is_published: boolean; updated_at?: string };
export const EMPTY_FAQ: FaqFormValues = { question: "", answer: "", is_published: true };

export function FaqForm({ id, initial }: { id: string | null; initial: FaqFormValues }) {
  return (
    <FormShell action={saveFaq.bind(null, id)} submitLabel={id ? "저장" : "FAQ 만들기"} resetKey={initial.updated_at ?? "new"}>
      {(fe) => (
        <>
          <div>
            <label htmlFor="f-question" className="block text-sm font-medium">질문</label>
            <textarea id="f-question" name="question" rows={2} maxLength={200} required defaultValue={initial.question} className={inputCls} />
            {fe.question ? <p className="mt-1 text-xs text-red-700">{fe.question}</p> : null}
          </div>
          <div>
            <label htmlFor="f-answer" className="block text-sm font-medium">답변</label>
            <textarea id="f-answer" name="answer" rows={6} maxLength={2000} required defaultValue={initial.answer} className={inputCls} />
            <p className="mt-1 text-xs text-muted">2,000자까지 쓸 수 있습니다.</p>
            {fe.answer ? <p className="mt-1 text-xs text-red-700">{fe.answer}</p> : null}
          </div>
          <label className="flex items-center gap-2 border border-line bg-surface p-4 text-sm">
            <input type="checkbox" name="is_published" defaultChecked={initial.is_published} />
            공개 (체크하면 홈페이지에 보입니다)
          </label>
        </>
      )}
    </FormShell>
  );
}
