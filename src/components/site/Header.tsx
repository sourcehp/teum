import Link from "next/link";
import { Button } from "./Button";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NAV_ITEMS } from "./nav";

export function Header({ companyName, logoUrl }: { companyName: string; logoUrl: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:h-20 md:px-8">
        <Logo companyName={companyName} logoUrl={logoUrl} />
        <nav aria-label="주 메뉴" className="hidden items-center gap-10 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-ink/80 transition-colors hover:text-accent-ink">
              {item.label}
            </Link>
          ))}
          <Button href="/contact" className="min-h-10 px-5">
            무료 상담 신청
          </Button>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}
