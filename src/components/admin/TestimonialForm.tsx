"use client";

import { saveTestimonial } from "@/app/admin/(panel)/testimonials/actions";
import { FormField } from "@/components/admin/FormField";
import { FormShell, inputCls } from "@/components/admin/FormShell";

export type TestimonialFormValues = {
  project_id: string | null;
  customer_label: string;
  space_label: string;
  rating: number;
  body: string;
  is_published: boolean;
  is_featured: boolean;
  is_sample: boolean;
  updated_at?: string;
};
export const EMPTY_TESTIMONIAL: TestimonialFormValues = {
  project_id: null,
  customer_label: "",
  space_label: "",
  rating: 5,
  body: "",
  is_published: false,
  is_featured: false,
  is_sample: false,
};
export type ProjectOption = { id: string; title: string; is_published: boolean };

export function TestimonialForm({
  id,
  initial,
  projects,
}: {
  id: string | null;
  initial: TestimonialFormValues;
  projects: ProjectOption[];
}) {
  return (
    <FormShell action={saveTestimonial.bind(null, id)} submitLabel={id ? "저장" : "후기 만들기"} resetKey={initial.updated_at ?? "new"}>
      {(fe) => (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="고객 표기" name="customer_label" required maxLength={30} defaultValue={initial.customer_label} error={fe.customer_label} hint="예: 성수동 김OO님 (실명 대신 일부만 표기)" />
            <FormField label="공간 표기" name="space_label" maxLength={30} defaultValue={initial.space_label} error={fe.space_label} hint="예: 32평 아파트" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="f-project_id" className="block text-sm font-medium">연결할 시공 사례</label>
              <select id="f-project_id" name="project_id" defaultValue={initial.project_id ?? ""} className={inputCls}>
                <option value="">연결 안 함</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                    {p.is_published ? "" : " (비공개)"}
                  </option>
                ))}
              </select>
              {fe.project_id ? <p className="mt-1 text-xs text-red-700">{fe.project_id}</p> : null}
            </div>
            <div>
              <label htmlFor="f-rating" className="block text-sm font-medium">별점</label>
              <select id="f-rating" name="rating" defaultValue={String(initial.rating)} className={inputCls}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}점
                  </option>
                ))}
              </select>
              {fe.rating ? <p className="mt-1 text-xs text-red-700">{fe.rating}</p> : null}
            </div>
          </div>
          <div>
            <label htmlFor="f-body" className="block text-sm font-medium">후기 내용</label>
            <textarea id="f-body" name="body" rows={6} maxLength={1000} required defaultValue={initial.body} className={inputCls} />
            <p className="mt-1 text-xs text-muted">1,000자까지 쓸 수 있습니다.</p>
            {fe.body ? <p className="mt-1 text-xs text-red-700">{fe.body}</p> : null}
          </div>
          <div className="space-y-2 border border-line bg-surface p-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_published" defaultChecked={initial.is_published} />
              공개 (체크하면 홈페이지에 보입니다)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_featured" defaultChecked={initial.is_featured} />
              홈 노출 (홈 화면 후기 영역에 표시)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_sample" defaultChecked={initial.is_sample} />
              샘플 (실제 고객 후기가 아닌 예시 콘텐츠)
            </label>
          </div>
        </>
      )}
    </FormShell>
  );
}
