import { revalidatePath } from "next/cache";

/** 관리자가 콘텐츠를 바꾼 뒤 공개 사이트 전체 캐시를 갱신한다. */
export function revalidateSite(): void {
  revalidatePath("/", "layout");
}
