import imageCompression from "browser-image-compression";

const MAX_BYTES = 10 * 1024 * 1024;
export const DECODE_ERROR = "이 형식의 사진은 올릴 수 없습니다. JPG 또는 PNG로 저장해 다시 올려 주세요";
export const TOO_LARGE_ERROR = "파일이 너무 큽니다(10MB 초과)";

/** 사진을 긴 변 2560px 이하 WebP로 줄인다(브라우저 전용). */
export async function resizeForUpload(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  let out: Blob;
  try {
    out = await imageCompression(file, {
      maxWidthOrHeight: 2560,
      fileType: "image/webp",
      initialQuality: 0.85,
      useWebWorker: true,
      maxSizeMB: 10,
    });
  } catch {
    throw new Error(DECODE_ERROR);
  }
  if (out.type !== "image/webp") out = await toWebp(out); // 라이브러리가 원본을 그대로 돌려준 경우
  if (out.size > MAX_BYTES) throw new Error(TOO_LARGE_ERROR);
  let size: { width: number; height: number };
  try {
    const bmp = await createImageBitmap(out);
    size = { width: bmp.width, height: bmp.height };
    bmp.close();
  } catch {
    throw new Error(DECODE_ERROR);
  }
  if (!size.width || !size.height) throw new Error(DECODE_ERROR);
  return { blob: out, ...size };
}

async function toWebp(src: Blob): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(src);
    const scale = Math.min(1, 2560 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
    if (!blob || blob.type !== "image/webp") throw new Error("encode");
    return blob;
  } catch {
    throw new Error(DECODE_ERROR);
  }
}
