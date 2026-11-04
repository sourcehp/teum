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
  onChange?: (v: string | undefined) => void;
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
              disabled={!onChange}
              onClick={onChange ? () => onChange(o.value || undefined) : undefined}
              className={`min-h-11 border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-ink disabled:hover:border-line"
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
  /** 없으면 비활성 상태로 그린다(서버 HTML 폴백). */
  onChange?: (next: ProjectFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Group
        label="공간 유형"
        options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
        value={filter.category}
        onChange={onChange && ((v) => onChange({ ...filter, category: v as ProjectFilter["category"] }))}
      />
      <Group
        label="평형"
        options={PYEONG_BUCKETS.map((b) => ({ value: b, label: PYEONG_LABELS[b] }))}
        value={filter.pyeong}
        onChange={onChange && ((v) => onChange({ ...filter, pyeong: v as ProjectFilter["pyeong"] }))}
      />
      <Group
        label="예산"
        options={BUDGET_RANGES.map((b) => ({ value: b, label: BUDGET_LABELS[b] }))}
        value={filter.budget}
        onChange={onChange && ((v) => onChange({ ...filter, budget: v as ProjectFilter["budget"] }))}
      />
    </div>
  );
}
