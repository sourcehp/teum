"use client";

import { useState } from "react";
import { josa } from "@/lib/domain/josa";
import { inputCls } from "@/components/admin/FormShell";
import { SingleImageField } from "@/components/admin/SingleImageField";

export type JsonField = {
  key: string;
  label: string;
  maxLength?: number;
  placeholder?: string;
  kind?: "text" | "image";
  /** 이미지 칸일 때 Storage 폴더 */
  folder?: "settings" | "partners";
  /** 한 줄로 좁게 보일 칸(짧은 값) */
  narrow?: boolean;
};

type Row = { id: string; values: Record<string, string> };

/** 행 추가·삭제·위아래 이동 편집기. 값은 hidden input 에 JSON 문자열로 담겨 서버로 간다. */
export function JsonListEditor({
  name,
  fields,
  initial,
  max,
  itemLabel,
  addLabel,
  error,
  sampleNotice = false,
  onDirty,
}: {
  name: string;
  fields: JsonField[];
  initial: Record<string, unknown>[];
  max: number;
  itemLabel: string;
  addLabel: string;
  error?: string;
  sampleNotice?: boolean;
  onDirty?: () => void;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((r) => ({
      id: crypto.randomUUID(),
      values: Object.fromEntries(fields.map((f) => [f.key, r[f.key] == null ? "" : String(r[f.key])])),
    })),
  );
  const [showSample, setShowSample] = useState(sampleNotice);

  const update = (next: Row[]) => {
    setRows(next);
    onDirty?.();
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };
  const setValue = (id: string, key: string, v: string) =>
    update(rows.map((r) => (r.id === id ? { ...r, values: { ...r.values, [key]: v } } : r)));

  const json = JSON.stringify(rows.map((r) => r.values));

  return (
    <div className="space-y-3">
      {showSample ? (
        <p role="note" className="border border-accent bg-accent/10 px-3 py-2 text-sm font-medium text-accent-ink">
          예시 값입니다. 실제 값으로 바꿔 주세요
        </p>
      ) : null}
      <input type="hidden" name={name} value={json} />
      {rows.length === 0 ? <p className="border border-dashed border-line bg-surface p-4 text-sm text-muted">아직 등록한 {josa(itemLabel, "이가")} 없습니다.</p> : null}
      <ol className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.id} className="border border-line bg-surface p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {itemLabel} {i + 1}
              </span>
              <span className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${itemLabel} ${i + 1} 위로`} className="border border-line px-2 py-1 text-xs hover:border-accent disabled:opacity-40">
                  위로
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`${itemLabel} ${i + 1} 아래로`} className="border border-line px-2 py-1 text-xs hover:border-accent disabled:opacity-40">
                  아래로
                </button>
                <button
                  type="button"
                  onClick={() => {
                    update(rows.filter((x) => x.id !== r.id));
                    setShowSample(false);
                  }}
                  aria-label={`${itemLabel} ${i + 1} 삭제`}
                  className="border border-line px-2 py-1 text-xs hover:border-red-700 hover:text-red-700"
                >
                  삭제
                </button>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) =>
                f.kind === "image" ? (
                  <div key={f.key} className="sm:col-span-2">
                    <SingleImageField
                      label={`${itemLabel} ${i + 1} ${f.label}`}
                      folder={f.folder ?? "partners"}
                      initialPath={r.values[f.key] || null}
                      onChange={(p) => setValue(r.id, f.key, p)}
                      compact
                    />
                  </div>
                ) : (
                  <label key={f.key} className="block text-sm">
                    <span className="text-xs text-muted">{f.label}</span>
                    <input
                      aria-label={`${itemLabel} ${i + 1} ${f.label}`}
                      value={r.values[f.key]}
                      maxLength={f.maxLength}
                      placeholder={f.placeholder}
                      onChange={(e) => {
                        setValue(r.id, f.key, e.target.value);
                        setShowSample(false);
                      }}
                      className={inputCls}
                    />
                  </label>
                ),
              )}
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        disabled={rows.length >= max}
        onClick={() => update([...rows, { id: crypto.randomUUID(), values: Object.fromEntries(fields.map((f) => [f.key, ""])) }])}
        className="border border-line bg-surface px-4 py-2 text-sm hover:border-accent disabled:opacity-50"
      >
        {addLabel}
      </button>
      <span className="ml-3 text-xs text-muted">
        {rows.length} / {max}개
      </span>
      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
