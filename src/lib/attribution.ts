export const ATTRIBUTION_KEY = "teum_attr";

export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_path: string | null;
};

const EMPTY: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  referrer: null,
  landing_path: null,
};

function clean(v: string | null | undefined, max = 200): string | null {
  const t = (v ?? "").trim();
  return t ? t.slice(0, max) : null;
}

/** 첫 방문의 유입 경로를 저장한다. 이미 저장돼 있으면 덮어쓰지 않는다. */
export function captureAttribution(loc: { href: string }, referrer: string, store: Storage): void {
  try {
    if (store.getItem(ATTRIBUTION_KEY)) return;
    const url = new URL(loc.href);
    let ref: string | null = clean(referrer, 500);
    if (ref) {
      try {
        if (new URL(ref).host === url.host) ref = null;
      } catch {
        ref = null;
      }
    }
    const value: Attribution = {
      utm_source: clean(url.searchParams.get("utm_source")),
      utm_medium: clean(url.searchParams.get("utm_medium")),
      utm_campaign: clean(url.searchParams.get("utm_campaign")),
      referrer: ref,
      landing_path: url.pathname,
    };
    store.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
  } catch {
    // 저장소가 막힌 환경에서는 조용히 건너뛴다.
  }
}

export function readAttribution(store: Storage): Attribution {
  try {
    const raw = store.getItem(ATTRIBUTION_KEY);
    if (!raw) return { ...EMPTY };
    const o = JSON.parse(raw) as Partial<Attribution>;
    const str = (v: unknown) => (typeof v === "string" && v ? v : null);
    return {
      utm_source: str(o.utm_source),
      utm_medium: str(o.utm_medium),
      utm_campaign: str(o.utm_campaign),
      referrer: str(o.referrer),
      landing_path: str(o.landing_path),
    };
  } catch {
    return { ...EMPTY };
  }
}
