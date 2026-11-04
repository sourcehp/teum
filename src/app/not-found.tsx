import { Button } from "@/components/site/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent-ink">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-4xl">페이지를 찾을 수 없습니다</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        주소가 바뀌었거나 삭제된 페이지입니다. 홈에서 다시 찾아보시거나 상담을 신청해 주세요.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href="/">홈으로 가기</Button>
        <Button href="/contact" variant="ghost">
          상담 문의
        </Button>
      </div>
    </main>
  );
}
