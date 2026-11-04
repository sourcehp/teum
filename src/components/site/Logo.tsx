import Link from "next/link";

export function Logo({ companyName, logoUrl }: { companyName: string; logoUrl: string | null }) {
  return (
    <Link href="/" aria-label={`${companyName} 홈`} className="flex items-center gap-3">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={companyName} className="h-9 w-auto md:h-11" />
      ) : (
        <>
          <span className="text-2xl font-semibold leading-none tracking-tight">틈</span>
          <span className="text-[10px] font-medium uppercase leading-none tracking-[0.28em] text-muted">
            TEUM DESIGN STUDIO
          </span>
        </>
      )}
    </Link>
  );
}
