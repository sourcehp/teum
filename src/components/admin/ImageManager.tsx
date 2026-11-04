"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  addProjectImages,
  deleteProjectImage,
  reorderProjectImages,
  setProjectImageRole,
  updateImageAlt,
} from "@/app/admin/(panel)/projects/actions";
import { SortableList } from "@/components/admin/SortableList";
import { UnsavedGuard } from "@/components/admin/UnsavedGuard";
import { Toast } from "@/components/admin/Toast";
import { resizeForUpload } from "@/lib/image-resize";
import { mediaUrl } from "@/lib/media";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export type ManagedImage = { id: string; storage_path: string; alt: string };
type Role = "cover" | "before" | "after";
type UploadStatus = "waiting" | "converting" | "uploading" | "done" | "failed";
type Uploaded = { storage_path: string; width: number; height: number };
type Upload = { key: string; file: File; status: UploadStatus; message?: string; uploaded?: Uploaded };

const STATUS_LABEL: Record<UploadStatus, string> = {
  waiting: "대기",
  converting: "변환 중",
  uploading: "업로드 중",
  done: "완료",
  failed: "실패",
};

const ROLE_LABEL: Record<Role, string> = { cover: "대표", before: "Before", after: "After" };

export function ImageManager({
  projectId,
  images,
  coverId,
  beforeId,
  afterId,
}: {
  projectId: string;
  images: ManagedImage[];
  coverId: string | null;
  beforeId: string | null;
  afterId: string | null;
}) {
  const router = useRouter();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "success" | "error"; n: number } | null>(null);
  const [, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const say = (msg: string, kind: "success" | "error" = "error") => setToast({ msg, kind, n: Date.now() });
  const patch = (key: string, p: Partial<Upload>) =>
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...p } : u)));

  async function run(targets: Upload[]) {
    setBusy(true);
    const supabase = createBrowserSupabase();
    let registered = 0;
    for (const u of targets) {
      let item = u.uploaded;
      try {
        if (!item) {
          patch(u.key, { status: "converting", message: undefined });
          const { blob, width, height } = await resizeForUpload(u.file);
          patch(u.key, { status: "uploading" });
          const path = `projects/${projectId}/${crypto.randomUUID()}.webp`;
          const { error } = await supabase.storage
            .from("media")
            .upload(path, blob, { contentType: "image/webp", upsert: false });
          if (error) throw new Error("업로드하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요");
          item = { storage_path: path, width, height };
          patch(u.key, { uploaded: item });
        }
      } catch (e) {
        patch(u.key, { status: "failed", message: e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다" });
        continue;
      }
      // 올린 즉시 등록한다. 등록만 실패하면 같은 경로로 등록을 다시 시도한다(재업로드 없음).
      try {
        patch(u.key, { status: "uploading", message: undefined });
        await addProjectImages(projectId, [item]);
        patch(u.key, { status: "done", uploaded: undefined });
        registered++;
        router.refresh();
      } catch {
        patch(u.key, { status: "failed", message: "사진 정보를 저장하지 못했습니다. 다시 시도해 주세요" });
      }
    }
    if (registered > 0) say(`사진 ${registered}장을 올렸습니다`, "success");
    setBusy(false);
  }

  function pick(files: FileList | File[]) {
    if (busy) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (list.length === 0) {
      say("사진 파일만 올릴 수 있습니다");
      return;
    }
    const items: Upload[] = list.map((file) => ({ key: crypto.randomUUID(), file, status: "waiting" }));
    setUploads((prev) => [...prev.filter((u) => u.status !== "done"), ...items]);
    void run(items);
  }

  function retry(u: Upload) {
    void run([u]);
  }

  const act = (fn: () => Promise<void>, okMsg?: string) =>
    startTransition(async () => {
      try {
        await fn();
        if (okMsg) say(okMsg, "success");
        router.refresh();
      } catch {
        say("처리하지 못했습니다. 잠시 후 다시 시도해 주세요");
      }
    });

  const roleOf = (id: string): Role | null =>
    id === coverId ? "cover" : id === beforeId ? "before" : id === afterId ? "after" : null;

  return (
    <section aria-labelledby="photos-h" className="space-y-4">
      <UnsavedGuard dirty={busy} />
      <h2 id="photos-h" className="text-lg font-semibold">
        사진
      </h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!busy && e.dataTransfer.files.length) pick(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed p-6 text-center ${dragOver ? "border-accent bg-accent/10" : "border-line bg-surface"}`}
      >
        <p className="text-sm text-muted">사진을 여기로 끌어 놓거나, 아래 버튼으로 여러 장을 한 번에 선택하세요.</p>
        <label className={`mt-3 inline-block bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:bg-accent-ink ${busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
          {busy ? "올리는 중…" : "사진 선택"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={busy}
            className="sr-only"
            data-testid="photo-input"
            onChange={(e) => {
              if (e.target.files?.length) pick(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-xs text-muted">휴대폰 사진도 자동으로 줄여서 올립니다.</p>
      </div>

      {uploads.length > 0 ? (
        <ul aria-label="업로드 상태" className="space-y-1.5 text-sm">
          {uploads.map((u) => (
            <li key={u.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-line bg-surface px-3 py-2">
              <span className="min-w-0 flex-1 truncate">{u.file.name}</span>
              <span className={u.status === "failed" ? "text-red-700" : u.status === "done" ? "text-green-800" : "text-muted"}>
                {STATUS_LABEL[u.status]}
              </span>
              {u.status === "failed" ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => retry(u)}
                    className="border border-line px-2 py-1 text-xs hover:border-accent disabled:opacity-50"
                  >
                    다시 시도
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploads((l) => l.filter((x) => x.key !== u.key))}
                    className="px-2 py-1 text-xs text-muted underline"
                  >
                    닫기
                  </button>
                  {u.message ? <p className="w-full text-xs text-red-700">{u.message}</p> : null}
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {images.length === 0 ? (
        <p className="text-sm text-muted">아직 올린 사진이 없습니다. 첫 사진은 자동으로 대표 사진이 됩니다.</p>
      ) : (
        <>
          <p className="text-xs text-muted">왼쪽 손잡이를 끌어 사진 순서를 바꿀 수 있습니다. 공개 페이지에 이 순서대로 보입니다.</p>
          <SortableList
            className="space-y-3"
            items={images}
            onReorder={(ids) => act(() => reorderProjectImages(projectId, ids))}
            renderItem={(img, handle) => {
              const role = roleOf(img.id);
              return (
                <div className="flex flex-wrap items-start gap-2 border border-line bg-surface p-3" data-testid="photo-row">
                  {handle}
                  <div className="relative h-24 w-32 shrink-0 bg-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(img.storage_path) ?? ""} alt={img.alt} className="h-full w-full object-cover" />
                    {role ? (
                      <span className="absolute left-1 top-1 bg-accent px-1.5 py-0.5 text-[11px] font-medium text-white">
                        {ROLE_LABEL[role]}
                      </span>
                    ) : null}
                  </div>
                  <div className="min-w-[14rem] flex-1 space-y-2">
                    <input
                      aria-label="사진 설명(대체 텍스트)"
                      defaultValue={img.alt}
                      maxLength={200}
                      placeholder="사진 설명 (예: 거실 전경)"
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v !== img.alt) act(() => updateImageAlt(img.id, v), "사진 설명을 저장했습니다");
                      }}
                      className="block w-full border border-line bg-surface px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {(["cover", "before", "after"] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          aria-pressed={role === r}
                          disabled={role === r}
                          onClick={() => act(() => setProjectImageRole(projectId, img.id, r))}
                          className="border border-line px-2.5 py-1 text-xs hover:border-accent disabled:border-accent disabled:bg-accent/10 disabled:text-accent-ink"
                        >
                          {role === r ? `${ROLE_LABEL[r]} 사진` : `${ROLE_LABEL[r]}로 지정`}
                        </button>
                      ))}
                      {role ? (
                        <button
                          type="button"
                          onClick={() => act(() => setProjectImageRole(projectId, img.id, null))}
                          className="px-2 py-1 text-xs text-muted underline"
                        >
                          지정 해제
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("이 사진을 삭제할까요? 되돌릴 수 없습니다."))
                            act(() => deleteProjectImage(img.id), "사진을 삭제했습니다");
                        }}
                        className="ml-auto border border-red-300 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </>
      )}
      {toast ? <Toast key={toast.n} message={toast.msg} kind={toast.kind} /> : null}
    </section>
  );
}
