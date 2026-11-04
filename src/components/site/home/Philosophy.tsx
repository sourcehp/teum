import { Section } from "../Section";

function paragraphs(value: string): string[] {
  return value.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

/** 홈 상단, 히어로 바로 아래에 두는 철학 선언. 회사 소개 페이지의 철학 문구(같은 값)를 공유한다. */
export function Philosophy({ text }: { text: string }) {
  const body = paragraphs(text);
  if (body.length === 0) return null;
  return (
    <Section eyebrow="PHILOSOPHY" title="여성의 섬세함, 엄마의 완벽함">
      <div className="max-w-3xl space-y-6 text-lg leading-loose text-muted md:text-xl">
        {body.map((p) => (
          <p key={p} className="whitespace-pre-line">{p}</p>
        ))}
      </div>
    </Section>
  );
}
