import { Resend } from "resend";
import { CATEGORY_LABELS, type Category } from "@/lib/domain/labels";

export type NotifyResult = "sent" | "failed" | "skipped";

export async function notifyNewInquiry(
  i: { id: string; name: string; phone: string; space_type: Category; created_at: string },
  to: string | null,
  timeoutMs = 5000,
): Promise<NotifyResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return "skipped";
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    const send = new Resend(key).emails.send({
      from: process.env.MAIL_FROM || "onboarding@resend.dev",
      to,
      subject: `[틈 홈페이지] 새 상담 문의 – ${i.name} (${CATEGORY_LABELS[i.space_type]})`,
      text: [
        `이름: ${i.name}`,
        `연락처: ${i.phone}`,
        `공간 유형: ${CATEGORY_LABELS[i.space_type]}`,
        `접수 시각: ${new Date(i.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`,
        "",
        `문의 상세: ${site}/admin/inquiries/${i.id}`,
      ].join("\n"),
    });
    // Resend가 응답하지 않아도 접수 처리가 멈추지 않도록 시간 제한을 둔다.
    const timeout = new Promise<"timeout">((resolve) => {
      timer = setTimeout(() => resolve("timeout"), timeoutMs);
    });
    const res = await Promise.race([send, timeout]);
    if (res === "timeout") {
      send.catch(() => {});
      return "failed";
    }
    return res.error ? "failed" : "sent";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timer);
  }
}
