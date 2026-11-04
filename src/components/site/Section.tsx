import type { ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  eyebrow,
  title,
  children,
  id,
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  children?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      <Container>
        {eyebrow || title ? (
          <header className="mb-10 md:mb-14">
            {eyebrow ? (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-accent-ink">{eyebrow}</p>
            ) : null}
            {title ? (
              <h2 className="text-2xl font-semibold leading-snug tracking-tight md:text-4xl">{title}</h2>
            ) : null}
          </header>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
