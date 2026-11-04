"use client";

import { BUDGET_LABELS, BUDGET_RANGES, CATEGORIES, CATEGORY_LABELS } from "@/lib/domain/labels";
import { PYEONG_LABELS } from "@/lib/domain/pyeong";
import { PYEONG_BUCKETS, type ProjectFilter } from "@/lib/project-filters";

type Option = { value: string; label: string };

function Group({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
}) {
  const all = [{ value: "", label: "전체" }, ...options];
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <span className="text-xs font-medium tracking-wide text-muted md:w-16">{label}</span>
      <div className="flex flex-wrap gap-2">
        {all.map((o) => {
          const active = (value ?? "") === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value || undefined)}
              className={`min-h-11 border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-ink"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectFilters({
  filter,
  onChange,
}: {
  filter: ProjectFilter;
  onChange: (next: ProjectFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Group
        label="공간 유형"
        options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
        value={filter.category}
        onChange={(v) => onChange({ ...filter, category: v as ProjectFilter["category"] })}
      />
      <Group
        label="평형"
        options={PYEONG_BUCKETS.map((b) => ({ value: b, label: PYEONG_LABELS[b] }))}
        value={filter.pyeong}
        onChange={(v) => onChange({ ...filter, pyeong: v as ProjectFilter["pyeong"] })}
      />
      <Group
        label="예산"
        options={BUDGET_RANGES.map((b) => ({ value: b, label: BUDGET_LABELS[b] }))}
        value={filter.budget}
        onChange={(v) => onChange({ ...filter, budget: v as ProjectFilter["budget"] })}
      />
    </div>
  );
}
