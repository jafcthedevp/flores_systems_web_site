/* eslint-disable @next/next/no-img-element -- next/og renderiza imágenes embebidas, no next/image. */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
export const alt = "Flores Systems — Sitios web y sistemas para tu negocio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpenGraphImage() {
  const logo = await readFile(
    path.join(process.cwd(), "public/img/flores-sys3_nobg.png"),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#eaf6fb",
        color: "#071c4d",
        padding: 70,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 700 }}>
        <span style={{ fontSize: 32, color: "#125ef3" }}>Flores Systems</span>
        <h1 style={{ fontSize: 68, letterSpacing: -3 }}>
          Que el trabajo fluya. Que tu marca se note.
        </h1>
        <span style={{ fontSize: 26 }}>
          Sitios web y sistemas para tu negocio
        </span>
      </div>
      {/* next/og requiere una imagen embebida, no el componente next/image. */}
      <img
        src={`data:image/png;base64,${logo.toString("base64")}`}
        width={360}
        height={360}
        alt=""
      />
    </div>,
    size,
  );
}
