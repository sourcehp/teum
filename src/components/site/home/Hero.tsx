import Image from "next/image";
import { Button } from "../Button";
import { Container } from "../Container";
import { Reveal } from "../Reveal";

export function Hero({
  title,
  subtitle,
  benefit,
  imageUrl,
  imageAlt,
}: {
  title: string;
  subtitle: string;
  benefit: string;
  imageUrl: string | null;
  imageAlt: string;
}) {
  return (
    <section className="pb-16 pt-12 md:pb-24 md:pt-20">
      <Container>
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-accent-ink">TEUM DESIGN STUDIO</p>
        <h1 className="max-w-4xl text-[2.25rem] font-semibold leading-[1.2] tracking-tight md:text-6xl md:leading-[1.15]">{title}</h1>
        {subtitle ? <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">{subtitle}</p> : null}
        {benefit ? (
          <p className="mt-8 inline-block border border-accent px-4 py-2 text-sm text-accent-ink">{benefit}</p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="#quick-inquiry" className="min-h-12 px-8">무료 상담 신청</Button>
          <Button href="/projects" variant="ghost" className="min-h-12 px-8">시공 사례 보기</Button>
        </div>
      </Container>
      <Container className="mt-12 md:mt-16">
        <Reveal>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-line md:aspect-[21/9]">
            {imageUrl ? (
              <Image src={imageUrl} alt={imageAlt} fill priority sizes="(min-width: 1200px) 1136px, 100vw" className="object-cover" />
            ) : null}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
