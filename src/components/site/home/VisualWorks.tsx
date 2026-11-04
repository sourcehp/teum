import Link from "next/link";
import { VisualWorkGrid, parseVisualWorks } from "../VisualWorkGrid";
import { Section } from "../Section";

/** 시각 디자인(BI) 작업 미리보기. 공간 디자인과 함께하는 두 번째 축임을 홈에서 짧게 보여준다. */
export function VisualWorks({ visualWorks }: { visualWorks: unknown }) {
  const items = parseVisualWorks(visualWorks).slice(0, 8);
  if (items.length === 0) return null;
  return (
    <Section eyebrow="VISUAL IDENTITY" title="공간을 넘어, 브랜드까지">
      <p className="-mt-6 mb-10 max-w-xl leading-relaxed text-muted">
        공간 디자인과 함께 로고·브랜드 디자인(BI) 작업도 함께합니다.
      </p>
      <VisualWorkGrid items={items} />
      <div className="mt-12">
        <Link href="/projects#visual" className="border-b border-ink pb-1 text-sm font-medium hover:border-accent-ink hover:text-accent-ink">
          시각 디자인 작업 더 보기
        </Link>
      </div>
    </Section>
  );
}
