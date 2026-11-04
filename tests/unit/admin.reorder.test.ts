import { describe, expect, it } from "vitest";
import { reorderWithRollback } from "@/lib/admin/reorder";

const a = { id: "a" }, b = { id: "b" }, c = { id: "c" };

describe("reorderWithRollback", () => {
  it("성공하면 새 순서를 유지한다", async () => {
    const seen: string[][] = [];
    const saved: string[][] = [];
    const ok = await reorderWithRollback([a, b, c], [b, a, c], (ids) => void saved.push(ids), (o) => seen.push(o.map((i) => i.id)));
    expect(ok).toBe(true);
    expect(saved).toEqual([["b", "a", "c"]]);
    expect(seen).toEqual([["b", "a", "c"]]);
  });

  it("저장이 거절되면 이전 순서로 되돌린다", async () => {
    const seen: string[][] = [];
    const ok = await reorderWithRollback([a, b, c], [c, a, b], () => Promise.reject(new Error("x")), (o) => seen.push(o.map((i) => i.id)));
    expect(ok).toBe(false);
    expect(seen).toEqual([["c", "a", "b"], ["a", "b", "c"]]);
  });
});
