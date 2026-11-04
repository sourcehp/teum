import { describe, it, expect } from "vitest";
import { aggregateByChannel } from "@/lib/domain/stats";

const row = (utm: string | null, ref: string | null, status: "new" | "in_progress" | "done" | "spam", at: string) =>
  ({ utm_source: utm, referrer: ref, status, created_at: at });

describe("aggregateByChannel", () => {
  const since = new Date("2026-11-01T00:00:00Z");
  const rows = [
    row("naver", null, "new", "2026-11-02T00:00:00Z"),
    row(null, "https://search.naver.com/", "done", "2026-11-03T00:00:00Z"),
    row(null, null, "new", "2026-11-03T00:00:00Z"),
    row("instagram", null, "spam", "2026-11-03T00:00:00Z"),
    row("naver", null, "new", "2026-10-31T23:59:59Z"),
    row("naver", null, "in_progress", "2026-11-01T00:00:00Z"),
  ];
  it("since 이전 제외, 채널·상태별 집계, total 내림차순", () => {
    const r = aggregateByChannel(rows, since);
    expect(r.map((x) => x.channel)).toEqual(["naver", "direct", "instagram"]); // 동률은 채널명 오름차순
    expect(r[0]).toEqual({ channel: "naver", total: 3, byStatus: { new: 1, in_progress: 1, done: 1, spam: 0 } });
    expect(r.map((x) => x.total)).toEqual([3, 1, 1]);
    expect(r.find((x) => x.channel === "instagram")?.byStatus.spam).toBe(1);
  });
  it("빈 입력", () => expect(aggregateByChannel([], since)).toEqual([]));
});
