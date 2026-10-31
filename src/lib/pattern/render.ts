import { EMPTY } from "@/lib/color/cleanup";
import { hexToRgb } from "@/lib/color/lab";
import type { Pattern } from "./pipeline";

export type View = "realistic" | "chart";

const FABRIC = "#f4efe2";

function shade(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (v: number) => Math.round(Math.min(255, Math.max(0, v + amt)));
  return `rgb(${f(r)} ${f(g)} ${f(b)})`;
}

/** Relative luminance, used to pick a readable symbol colour over a swatch. */
export function isDark(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}

// Below this many screen pixels per stitch, individual stitches are too small to
// read; drawn as Xs they turn into a muddy dot pattern. Draw smooth colour
// blocks with a faint weave instead, and save the full stitch look for zoom-in.
export const SMOOTH_BELOW = 10;

function drawSmooth(ctx: CanvasRenderingContext2D, p: Pattern, cell: number): void {
  const { width, height, cells, palette } = p;
  ctx.fillStyle = FABRIC;
  ctx.fillRect(0, 0, width * cell, height * cell);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = cells[y * width + x];
      if (c === EMPTY) continue;
      ctx.fillStyle = palette[c].hex;
      // Slight overdraw hides hairline seams between blocks at fractional sizes
      ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
    }
  }
  if (cell < 4) return;
  // Very soft stitch texture: one faint highlight per stitch, no holes.
  ctx.strokeStyle = "rgb(255 255 255 / 0.1)";
  ctx.lineWidth = Math.max(1, cell * 0.3);
  ctx.beginPath();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (cells[y * width + x] === EMPTY) continue;
      ctx.moveTo(x * cell + cell * 0.2, y * cell + cell * 0.2);
      ctx.lineTo(x * cell + cell * 0.8, y * cell + cell * 0.8);
    }
  }
  ctx.stroke();
}

export function drawRealistic(ctx: CanvasRenderingContext2D, p: Pattern, cell: number): void {
  if (cell < SMOOTH_BELOW) {
    drawSmooth(ctx, p, cell);
    return;
  }
  const { width, height, cells, palette } = p;
  ctx.fillStyle = FABRIC;
  ctx.fillRect(0, 0, width * cell, height * cell);
  // Aida holes at stitch corners, only once they are big enough to read as holes
  if (cell >= 12) {
    ctx.fillStyle = "rgb(120 105 80 / 0.18)";
    const r = cell * 0.06;
    for (let y = 0; y <= height; y++) for (let x = 0; x <= width; x++) ctx.fillRect(x * cell - r, y * cell - r, r * 2, r * 2);
  }
  // Two strands on 14-count cover nearly the whole square, so legs are thick and run close to the corners.
  const lw = Math.max(1.2, cell * 0.5);
  const inset = cell * 0.08;
  ctx.lineCap = "round";
  ctx.lineWidth = lw;
  const under = palette.map((c) => shade(c.hex, -22));
  const over = palette.map((c) => shade(c.hex, 12));
  // Bottom legs first, then top legs, like a real stitcher working a row.
  for (const pass of [0, 1] as const) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = cells[y * width + x];
        if (c === EMPTY) continue;
        const x0 = x * cell + inset;
        const y0 = y * cell + inset;
        const x1 = (x + 1) * cell - inset;
        const y1 = (y + 1) * cell - inset;
        ctx.strokeStyle = pass === 0 ? under[c] : over[c];
        ctx.beginPath();
        if (pass === 0) {
          ctx.moveTo(x0, y1);
          ctx.lineTo(x1, y0);
        } else {
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
        }
        ctx.stroke();
      }
    }
  }
}

export function drawChart(ctx: CanvasRenderingContext2D, p: Pattern, cell: number, colour = true): void {
  const { width, height, cells, palette } = p;
  const W = width * cell;
  const H = height * cell;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(cell * 0.72)}px Helvetica, Arial, sans-serif`;
  const ink = palette.map((c) => (colour && isDark(c.hex) ? "#ffffff" : "#1a1a1a"));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = cells[y * width + x];
      if (c === EMPTY) continue;
      if (colour) {
        ctx.fillStyle = palette[c].hex;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
      if (cell >= 9) {
        ctx.fillStyle = ink[c];
        ctx.fillText(palette[c].symbol, x * cell + cell / 2, y * cell + cell / 2 + 1);
      }
    }
  }
  // Grid: thin every stitch, bold every 10.
  for (const bold of [false, true]) {
    ctx.strokeStyle = bold ? "#1a1a1a" : "rgb(0 0 0 / 0.18)";
    ctx.lineWidth = bold ? Math.max(1.5, cell * 0.12) : 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x++) {
      if ((x % 10 === 0 || x === width) !== bold) continue;
      ctx.moveTo(x * cell + 0.5, 0);
      ctx.lineTo(x * cell + 0.5, H);
    }
    for (let y = 0; y <= height; y++) {
      if ((y % 10 === 0 || y === height) !== bold) continue;
      ctx.moveTo(0, y * cell + 0.5);
      ctx.lineTo(W, y * cell + 0.5);
    }
    ctx.stroke();
  }
}
