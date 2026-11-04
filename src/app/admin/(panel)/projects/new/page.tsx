import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { EMPTY_PROJECT, ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "새 시공 사례" };

export default async function NewProjectPage() {
  await requireAdmin();
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="새 시공 사례"
        description="먼저 기본 정보를 저장하면 사진을 올릴 수 있습니다."
        actions={
          <Link href="/admin/projects" className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
            목록으로
          </Link>
        }
      />
      <ProjectForm id={null} initial={EMPTY_PROJECT} />
    </div>
  );
}
