import { describe, expect, it } from "vitest";
import { firstError } from "@/lib/admin/results";

describe("firstError", () => {
  it("오류가 없으면 null", () => {
    expect(firstError([{ error: null }, { error: null }])).toBeNull();
    expect(firstError([])).toBeNull();
  });
  it("처음 나온 오류를 돌려준다", () => {
    expect(firstError([{ error: null }, { error: { message: "a" } }, { error: { message: "b" } }])).toEqual({ message: "a" });
  });
});
