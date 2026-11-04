import { classifyChannel } from "./channel";
import { INQUIRY_STATUSES, type InquiryStatus } from "./labels";

export type ChannelStat = { channel: string; total: number; byStatus: Record<InquiryStatus, number> };

export function aggregateByChannel(
  rows: { utm_source: string | null; referrer: string | null; status: InquiryStatus; created_at: string }[],
  since: Date,
): ChannelStat[] {
  const map = new Map<string, ChannelStat>();
  for (const r of rows) {
    if (new Date(r.created_at).getTime() < since.getTime()) continue;
    const channel = classifyChannel(r);
    let stat = map.get(channel);
    if (!stat) {
      stat = {
        channel,
        total: 0,
        byStatus: Object.fromEntries(INQUIRY_STATUSES.map((s) => [s, 0])) as Record<InquiryStatus, number>,
      };
      map.set(channel, stat);
    }
    stat.total++;
    stat.byStatus[r.status]++;
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.channel.localeCompare(b.channel));
}
