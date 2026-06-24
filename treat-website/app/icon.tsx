import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#08080E",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 5,
          padding: "7px 6px",
          borderRadius: 8,
        }}
      >
        {/* 3 bars: large to small */}
        <div style={{ width: 18, height: 3, borderRadius: 2, background: "#6366F1" }} />
        <div style={{ width: 12, height: 3, borderRadius: 2, background: "#6366F1" }} />
        <div style={{ width: 7, height: 3, borderRadius: 2, background: "#6366F1" }} />
      </div>
    ),
    { ...size }
  );
}
