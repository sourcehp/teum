"use client";

import { useRef, useState } from "react";
import { resizeForUpload } from "@/lib/image-resize";
import { mediaUrl } from "@/lib/media";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/**
 * 사진 한 장 올리기/바꾸기/지우기. 브라우저에서 WebP 로 줄여 media/{folder}/ 에 올리고 경로를 hidden input 으로 보낸다.
 * 이전 파일 삭제는 저장 시 서버가 처리한다.
 */
export function SingleImageField({
  label,
  name,
  folder,
  initialPath,
  hint,
  onChange,
  compact = false,
}: {
  label: string;
  name?: string;
  folder: "settings" | "partners";
  initialPath: string | null;
  hint?: string;
  onChange?: (path: string) => void;
  compact?: boolean;
}) {
  const [path, setPath] = useState(initialPath ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = mediaUrl(path || null);

  function set(p: string) {
    setPath(p);
    onChange?.(p);
  }

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const { blob } = await resizeForUpload(file);
      const next = `${folder}/${crypto.randomUUID()}.webp`;
      const { error: upErr } = await createBrowserSupabase()
        .storage.from("media")
        .upload(next, blob, { contentType: "image/webp", upsert: false });
      if (upErr) throw new Error("업로드하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요");
      set(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      {name ? <input type="hidden" name={name} value={path} /> : null}
      <div className="mt-1 flex items-center gap-3">
        <div className={`flex shrink-0 items-center justify-center overflow-hidden border border-line bg-bg ${compact ? "h-12 w-20" : "h-20 w-32"}`}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={`${label} 미리보기`} className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-muted">없음</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={`border border-line bg-surface px-3 py-1.5 text-sm hover:border-accent ${busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
            {busy ? "올리는 중…" : path ? "사진 바꾸기" : "사진 선택"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*,.heic,.heif"
              className="sr-only"
              aria-label={`${label} 파일 선택`}
              disabled={busy}
              onChange={(e) => void pick(e.target.files?.[0])}
            />
          </label>
          {path ? (
            <button type="button" disabled={busy} onClick={() => set("")} className="border border-line bg-surface px-3 py-1.5 text-sm hover:border-red-700 hover:text-red-700">
              지우기
            </button>
          ) : null}
        </div>
      </div>
      {hint && !error ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
