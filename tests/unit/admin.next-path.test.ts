import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/admin/next-path";

describe("safeNextPath", () => {
  it("관리자 경로는 그대로 허용한다", () => {
    expect(safeNextPath("/admin")).toBe("/admin");
    expect(safeNextPath("/admin/projects")).toBe("/admin/projects");
    expect(safeNextPath("/admin?x=1")).toBe("/admin?x=1");
    expect(safeNextPath("/admin/inquiries?status=new")).toBe("/admin/inquiries?status=new");
  });
  it("외부·이상한 값은 /admin으로 되돌린다", () => {
    for (const v of ["//evil.com", "https://evil.com", "/admin//evil.com", "/adminx", "/admin\\evil", "/admin/x://y", "/", "", null, undefined, 3, "projects"]) {
      expect(safeNextPath(v)).toBe("/admin");
    }
  });
});
