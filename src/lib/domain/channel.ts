export const CHANNEL_LABELS: Record<string, string> = {
  naver: "네이버",
  google: "구글",
  instagram: "인스타그램",
  facebook: "페이스북",
  kakao: "카카오",
  youtube: "유튜브",
  direct: "직접 방문",
};

/** utm_source 는 방문자가 정하는 값이라 '__proto__' 같은 키도 올 수 있다. 자기 속성만 조회한다. */
export function channelLabel(c: string): string {
  return Object.hasOwn(CHANNEL_LABELS, c) ? CHANNEL_LABELS[c] : c;
}

const HOST_CHANNELS: [string, string[]][] = [
  ["naver", ["naver.com"]],
  ["google", ["google.com", "google.co.kr"]],
  ["instagram", ["instagram.com"]],
  ["facebook", ["facebook.com", "fb.com"]],
  ["kakao", ["kakao.com", "daum.net"]],
  ["youtube", ["youtube.com", "youtu.be"]],
];

function hostOf(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).hostname.toLowerCase();
    return h === "" ? null : h;
  } catch {
    return null;
  }
}

export function classifyChannel(i: { utm_source: string | null; referrer: string | null }): string {
  const utm = i.utm_source?.trim().toLowerCase();
  if (utm) return utm;
  const host = hostOf(i.referrer);
  if (!host) return "direct";
  for (const [channel, domains] of HOST_CHANNELS) {
    if (domains.some((d) => host === d || host.endsWith("." + d))) return channel;
  }
  return host;
}
