"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px",
          textAlign: "center",
          background: "#F7F5F2",
          color: "#1F1E1C",
          fontFamily: '"Pretendard Variable", Pretendard, system-ui, sans-serif',
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>일시적인 문제가 발생했습니다</h1>
        <p style={{ marginTop: 16, color: "#6E6A64", fontSize: 14, lineHeight: 1.7 }}>
          잠시 후 다시 시도해 주세요. 문제가 계속되면 전화나 카카오톡으로 문의해 주세요.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 32,
            minHeight: 44,
            padding: "0 28px",
            border: 0,
            background: "#1F1E1C",
            color: "#F7F5F2",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
