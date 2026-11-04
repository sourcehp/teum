import { Resend } from "resend";
import { CATEGORY_LABELS, type Category } from "@/lib/domain/labels";

export type NotifyResult = "sent" | "failed" | "skipped";

export async function notifyNewInquiry(
  i: { id: string; name: string; phone: string; space_type: Category; created_at: string },
  to: string | null,
): Promise<NotifyResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return "skipped";
  try {
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    const { error } = await new Resend(key).emails.send({
      from: process.env.MAIL_FROM || "onboarding@resend.dev",
      to,
      subject: `[틈 홈페이지] 새 상담 문의 – ${i.name} (${CATEGORY_LABELS[i.space_type]})`,
      text: [
        `이름: ${i.name}`,
        `연락처: ${i.phone}`,
        `공간 유형: ${CATEGORY_LABELS[i.space_type]}`,
        `접수 시각: ${i.created_at}`,
        "",
        `문의 상세: ${site}/admin/inquiries/${i.id}`,
      ].join("\n"),
    });
    return error ? "failed" : "sent";
  } catch {
    return "failed";
  }
}
