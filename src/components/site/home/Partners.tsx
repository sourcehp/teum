import Image from "next/image";
import { mediaUrl } from "@/lib/media";
import { Container } from "../Container";
import { asRecords, text } from "./json";

export function Partners({ partners }: { partners: unknown }) {
  const items = asRecords(partners)
    .map((p) => ({ name: text(p.name), logo: mediaUrl(text(p.logo_path)), url: text(p.url) }))
    .filter((p) => p.name);
  if (items.length === 0) return null;
  return (
    <section aria-label="언론·파트너" className="border-t border-line py-14 md:py-16">
      <Container>
        <p className="mb-8 text-xs font-medium uppercase tracking-[0.24em] text-muted">Press &amp; Partners</p>
        <ul className="flex flex-wrap items-center gap-x-12 gap-y-6">
          {items.map((p) => {
            const inner = p.logo ? (
              <Image src={p.logo} alt={p.name} width={140} height={48} className="h-10 w-auto object-contain opacity-70 grayscale" />
            ) : (
              <span className="text-sm text-muted">{p.name}</span>
            );
            return (
              <li key={p.name}>
                {/^https?:\/\//.test(p.url) ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer">{inner}</a>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
