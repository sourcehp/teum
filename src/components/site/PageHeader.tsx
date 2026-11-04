import type { ReactNode } from "react";
import { Container } from "./Container";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="border-b border-line pb-12 pt-16 md:pb-16 md:pt-24">
      <Container>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-accent-ink">{eyebrow}</p>
        <h1 className="text-3xl font-semibold leading-snug tracking-tight [word-break:keep-all] md:text-5xl">{title}</h1>
        {children ? <div className="mt-6 max-w-2xl leading-relaxed text-muted">{children}</div> : null}
      </Container>
    </header>
  );
}
