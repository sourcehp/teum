import type { ProjectDetail } from "@/lib/data/public";
import { BUDGET_LABELS, CATEGORY_LABELS } from "@/lib/domain/labels";

export function ProjectFacts({ project }: { project: ProjectDetail }) {
  const completed = project.completed_on ? project.completed_on.slice(0, 7).replace("-", ".") : null;
  const facts: [string, string][] = [
    ["카테고리", CATEGORY_LABELS[project.category]],
    project.location ? ["위치", project.location] : null,
    project.area_pyeong ? ["평수", `${project.area_pyeong}평`] : null,
    project.budget_range !== "undisclosed" ? ["예산대", BUDGET_LABELS[project.budget_range]] : null,
    project.duration_weeks ? ["공사 기간", `${project.duration_weeks}주`] : null,
    completed ? ["완공", completed] : null,
  ].filter((x): x is [string, string] => x !== null);
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 md:grid-cols-3">
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs tracking-wide text-muted">{k}</dt>
          <dd className="mt-1 font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
