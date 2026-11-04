import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "내 계정" };

export default async function AccountPage() {
  await requireAdmin();
  return (
    <div className="max-w-3xl">
      <PageHeader title="내 계정" description="로그인 비밀번호를 바꿉니다. 처음 받은 임시 비밀번호는 꼭 바꿔 주세요." />
      <PasswordForm />
    </div>
  );
}
