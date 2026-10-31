import { drawChart } from "./render";
import type { Pattern } from "./pipeline";

const CELL = 16;
const MARGIN = 32;

/** Full chart as a PNG: colour squares, symbols, 10-stitch guide lines and edge numbers. */
export async function buildChartPng(p: Pattern): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = p.width * CELL + MARGIN * 2;
  canvas.height = p.height * CELL + MARGIN * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(MARGIN, MARGIN);
  drawChart(ctx, p, CELL);
  ctx.restore();

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "600 11px Helvetica, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let x = 10; x <= p.width; x += 10) {
    ctx.fillText(String(x), MARGIN + x * CELL, MARGIN / 2);
    ctx.fillText(String(x), MARGIN + x * CELL, MARGIN * 1.5 + p.height * CELL);
  }
  for (let y = 10; y <= p.height; y += 10) {
    ctx.fillText(String(y), MARGIN / 2, MARGIN + y * CELL);
    ctx.fillText(String(y), MARGIN * 1.5 + p.width * CELL, MARGIN + y * CELL);
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create the PNG"))), "image/png"),
  );
}
