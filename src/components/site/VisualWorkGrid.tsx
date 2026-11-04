import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import { asRecords, text } from "./home/json";

export type VisualWork = { name: string; summary: string; logo: string | null; url: string };

export function parseVisualWorks(visualWorks: unknown): VisualWork[] {
  return asRecords(visualWorks)
    .map((p) => ({
      name: text(p.client_name),
      summary: text(p.summary),
      logo: mediaUrl(text(p.logo_path) || null),
      url: text(p.url),
    }))
    .filter((p) => p.name);
}

/** 시각 디자인(BI) 작업을 카드 그리드로 보여준다. 항목이 없으면 아무것도 그리지 않는다. */
export function VisualWorkGrid({ items }: { items: VisualWork[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
      {items.map((p, i) => {
        const external = /^https?:\/\//.test(p.url);
        const card = (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface p-6 text-center transition-colors group-hover:bg-bg group-focus-visible:bg-bg">
            <div className="flex h-14 w-full items-center justify-center">
              {p.logo ? (
                <Image src={p.logo} alt="" width={160} height={56} className="h-full w-auto max-w-full object-contain" />
              ) : (
                <span aria-hidden="true" className="text-sm font-medium">{p.name}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{p.name}</p>
              {p.summary ? <p className="mt-0.5 text-xs text-muted">{p.summary}</p> : null}
              {external ? <span className="sr-only">(새 창에서 열림)</span> : null}
            </div>
          </div>
        );
        return (
          <li key={`${p.name}-${i}`} className="group">
            {external ? (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="block h-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink">
                {card}
              </a>
            ) : (
              card
            )}
          </li>
        );
      })}
    </ul>
  );
}
