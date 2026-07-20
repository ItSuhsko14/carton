import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Генератор протестних картонок";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#18181b",
          color: "#fafafa",
          fontFamily: "sans-serif",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div style={{ fontSize: 120 }}>✊</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
            Генератор протестних картонок
          </div>
          <div style={{ fontSize: 34, color: "#a1a1aa", maxWidth: 900 }}>
            Оберіть шаблон, додайте напис і завантажте готовий плакат
          </div>
        </div>
      </div>
    ),
    size,
  );
}
