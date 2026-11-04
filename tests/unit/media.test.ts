import { describe, expect, it } from "vitest";
import { mediaUrl } from "@/lib/media";

describe("mediaUrl", () => {
  it("정적 경로와 외부 URL은 그대로 돌려준다", () => {
    expect(mediaUrl("/samples/a.webp")).toBe("/samples/a.webp");
    expect(mediaUrl("https://example.com/a.webp")).toBe("https://example.com/a.webp");
  });
  it("저장소 경로는 공개 스토리지 URL로 만든다", () => {
    expect(mediaUrl("projects/x/y.webp")).toBe(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/projects/x/y.webp`,
    );
  });
  it("null·undefined·빈 문자열은 null", () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl("")).toBeNull();
  });
});
