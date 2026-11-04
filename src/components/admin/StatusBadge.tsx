import { STATUS_LABELS, type InquiryStatus } from "@/lib/domain/labels";

const STYLES: Record<InquiryStatus, string> = {
  new: "bg-accent/15 text-accent-ink",
  in_progress: "bg-blue-50 text-blue-800",
  done: "bg-green-50 text-green-800",
  spam: "bg-line text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  const known = status in STATUS_LABELS;
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium ${known ? STYLES[status as InquiryStatus] : "bg-line text-muted"}`}
    >
      {known ? STATUS_LABELS[status as InquiryStatus] : status}
    </span>
  );
}
