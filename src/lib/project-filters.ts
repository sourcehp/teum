import type { ProjectCard } from "@/lib/data/public";
import { BUDGET_RANGES, CATEGORIES, type BudgetRange, type Category } from "@/lib/domain/labels";
import { pyeongBucket, type PyeongBucket } from "@/lib/domain/pyeong";

export type ProjectFilter = { category?: Category; pyeong?: PyeongBucket; budget?: BudgetRange };

export const PYEONG_BUCKETS: readonly PyeongBucket[] = ["lt20", "20to30", "30to40", "gte40"];

function pick<T extends string>(allowed: readonly T[], v: string | null): T | undefined {
  return v !== null && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
}

export function parseProjectFilter(sp: URLSearchParams): ProjectFilter {
  const f: ProjectFilter = {};
  const category = pick(CATEGORIES, sp.get("category"));
  const pyeong = pick(PYEONG_BUCKETS, sp.get("pyeong"));
  const budget = pick(BUDGET_RANGES, sp.get("budget"));
  if (category) f.category = category;
  if (pyeong) f.pyeong = pyeong;
  if (budget) f.budget = budget;
  return f;
}

export function filterProjects(list: ProjectCard[], f: ProjectFilter): ProjectCard[] {
  return list.filter(
    (p) =>
      (!f.category || p.category === f.category) &&
      (!f.pyeong || pyeongBucket(p.area_pyeong) === f.pyeong) &&
      (!f.budget || p.budget_range === f.budget),
  );
}

export function filterToQuery(f: ProjectFilter): string {
  const sp = new URLSearchParams();
  if (f.category) sp.set("category", f.category);
  if (f.pyeong) sp.set("pyeong", f.pyeong);
  if (f.budget) sp.set("budget", f.budget);
  return sp.toString();
}
