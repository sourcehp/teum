import Link from "next/link";

export function SampleWarning({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <div role="note" className="mb-6 border border-accent bg-accent/10 px-4 py-3 text-sm">
      <p className="font-medium text-accent-ink">
        샘플 콘텐츠 {count}개가 공개 중입니다. 실제 콘텐츠로 교체하거나 비공개로 바꿔 주세요.
      </p>
      <p className="mt-1 space-x-4">
        <Link href="/admin/projects" className="underline">
          시공 사례 확인
        </Link>
        <Link href="/admin/testimonials" className="underline">
          고객 후기 확인
        </Link>
      </p>
    </div>
  );
}
