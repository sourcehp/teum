"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { FormField } from "@/components/admin/FormField";
import { Toast } from "@/components/admin/Toast";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import { saveProject, type SaveState } from "@/app/admin/(panel)/projects/actions";
import { BUDGET_LABELS, BUDGET_RANGES, CATEGORIES, CATEGORY_LABELS } from "@/lib/domain/labels";

export type ProjectFormValues = {
  title: string;
  slug: string;
  category: string;
  location: string;
  area_pyeong: number | null;
  budget_range: string;
  duration_weeks: number | null;
  completed_on: string | null;
  summary: string;
  body: string;
  is_published: boolean;
  is_featured: boolean;
  is_sample: boolean;
  seo_title: string | null;
  seo_description: string | null;
  updated_at?: string;
};

export const EMPTY_PROJECT: ProjectFormValues = {
  title: "",
  slug: "",
  category: "residential",
  location: "",
  area_pyeong: null,
  budget_range: "undisclosed",
  duration_weeks: null,
  completed_on: null,
  summary: "",
  body: "",
  is_published: false,
  is_featured: false,
  is_sample: false,
  seo_title: null,
  seo_description: null,
};

const textareaCls =
  "mt-1 block w-full border border-line bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export function ProjectForm({ id, initial }: { id: string | null; initial: ProjectFormValues }) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveProject.bind(null, id), { ok: false });
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.ok) {
      setDirty(false);
      setSavedAt(Date.now());
    }
  }, [state]);

  return (
    <form
      onChange={() => setDirty(true)}
      onSubmit={(e) => {
        // 검사 오류가 있어도 입력한 내용이 지워지지 않도록 폼 자동 초기화를 쓰지 않는다.
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
      className="space-y-5"
    >
      <UnsavedGuard dirty={dirty} />
      <fieldset key={initial.updated_at ?? "new"} className="space-y-5">
        <FormField
          label="제목"
          name="title"
          required
          maxLength={100}
          defaultValue={initial.title}
          error={fe.title}
          hint="예: 성수동 32평 아파트 인테리어 — 지역·평수·공간 유형을 넣으면 검색에 잘 나옵니다"
        />
        <FormField
          label="주소(URL)"
          name="slug"
          defaultValue={initial.slug}
          error={fe.slug}
          hint="비우면 제목으로 자동 생성"
        />

        <div>
          <span className="block text-sm font-medium">분류</span>
          <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2" role="radiogroup" aria-label="분류">
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input type="radio" name="category" value={c} defaultChecked={initial.category === c} />
                {CATEGORY_LABELS[c]}
              </label>
            ))}
          </div>
          {fe.category ? <p className="mt-1 text-xs text-red-700">{fe.category}</p> : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="지역" name="location" maxLength={50} defaultValue={initial.location} error={fe.location} hint="예: 서울 성동구" />
          <FormField
            label="평수"
            name="area_pyeong"
            type="number"
            step="any"
            min="0"
            defaultValue={initial.area_pyeong ?? ""}
            error={fe.area_pyeong}
            hint="숫자만 입력 (모르면 비워 두세요)"
          />
          <div>
            <label htmlFor="f-budget_range" className="block text-sm font-medium">
              예산
            </label>
            <select id="f-budget_range" name="budget_range" defaultValue={initial.budget_range} className={textareaCls}>
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b}>
                  {BUDGET_LABELS[b]}
                </option>
              ))}
            </select>
          </div>
          <FormField
            label="공사 기간(주)"
            name="duration_weeks"
            type="number"
            step="1"
            min="1"
            max="520"
            defaultValue={initial.duration_weeks ?? ""}
            error={fe.duration_weeks}
          />
          <FormField label="완료일" name="completed_on" type="date" defaultValue={initial.completed_on ?? ""} error={fe.completed_on} />
        </div>

        <div>
          <label htmlFor="f-summary" className="block text-sm font-medium">
            한 줄 요약
          </label>
          <textarea id="f-summary" name="summary" rows={2} maxLength={200} defaultValue={initial.summary} className={textareaCls} />
          {fe.summary ? <p className="mt-1 text-xs text-red-700">{fe.summary}</p> : null}
        </div>
        <div>
          <label htmlFor="f-body" className="block text-sm font-medium">
            상세 설명
          </label>
          <textarea id="f-body" name="body" rows={8} maxLength={10000} defaultValue={initial.body} className={textareaCls} />
          <p className="mt-1 text-xs text-muted">빈 줄로 문단을 나눌 수 있습니다.</p>
          {fe.body ? <p className="mt-1 text-xs text-red-700">{fe.body}</p> : null}
        </div>

        <div className="space-y-2 border border-line bg-surface p-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" defaultChecked={initial.is_published} />
            공개 (체크하면 홈페이지에 보입니다)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" defaultChecked={initial.is_featured} />
            홈 노출 (홈 화면 대표 사례에 표시)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_sample" defaultChecked={initial.is_sample} />
            샘플 (실제 시공이 아닌 예시 콘텐츠)
          </label>
        </div>

        <details className="border border-line bg-surface p-4">
          <summary className="cursor-pointer text-sm font-medium">검색 노출 설정 (선택)</summary>
          <div className="mt-4 space-y-5">
            <FormField label="검색 제목" name="seo_title" maxLength={70} defaultValue={initial.seo_title ?? ""} error={fe.seo_title} hint="비우면 제목을 사용합니다 (70자 이내)" />
            <div>
              <label htmlFor="f-seo_description" className="block text-sm font-medium">
                검색 설명
              </label>
              <textarea id="f-seo_description" name="seo_description" rows={2} maxLength={160} defaultValue={initial.seo_description ?? ""} className={textareaCls} />
              <p className="mt-1 text-xs text-muted">비우면 한 줄 요약을 사용합니다 (160자 이내)</p>
              {fe.seo_description ? <p className="mt-1 text-xs text-red-700">{fe.seo_description}</p> : null}
            </div>
          </div>
        </details>
      </fieldset>

      {state.error && !state.ok ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:bg-accent-ink disabled:opacity-60"
        >
          {pending ? "저장 중…" : id ? "저장" : "사례 만들기"}
        </button>
        {dirty ? <span className="text-xs text-muted">저장하지 않은 변경이 있습니다</span> : null}
      </div>
      <Toast key={savedAt} message={state.ok ? "저장했습니다" : null} />
    </form>
  );
}
