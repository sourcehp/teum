import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "틈디자인스튜디오 | 공간 인테리어 설계·시공";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const font = await readFile(
    path.join(process.cwd(), "node_modules/pretendard/dist/public/static/Pretendard-SemiBold.otf"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#F7F5F2",
          color: "#1F1E1C",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ fontSize: 240, lineHeight: 1, fontWeight: 600, display: "flex" }}>틈</div>
        <div style={{ width: 120, height: 6, background: "#B8916A", margin: "36px 0", display: "flex" }} />
        <div style={{ fontSize: 44, letterSpacing: 8, display: "flex" }}>TEUM DESIGN STUDIO</div>
        <div style={{ fontSize: 36, marginTop: 16, display: "flex" }}>공간 인테리어 설계·시공</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Pretendard", data: font, weight: 600, style: "normal" }] },
  );
}
