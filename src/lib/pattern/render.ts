import { EMPTY } from "@/lib/color/cleanup";
import { hexToRgb } from "@/lib/color/lab";
import type { Pattern } from "./pipeline";

export type View = "realistic" | "chart";

/** How the "Realistic" view draws one cell when zoomed in. */
export type StitchStyle = "cross" | "bead" | "drill" | "block" | "knit";

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

/** Height of a cell for a given width; knitting cells are wider than tall. */
export function cellHeight(p: Pattern, cell: number): number {
  return cell * (p.cellAspect ?? 1);
}

// Below this many screen pixels per stitch, individual stitches are too small to
// read; drawn as Xs they turn into a muddy dot pattern. Draw smooth colour
// blocks with a faint weave instead, and save the full stitch look for zoom-in.
export const SMOOTH_BELOW = 10;

function drawSmooth(ctx: CanvasRenderingContext2D, p: Pattern, cell: number): void {
  const { width, height, cells, palette } = p;
  const ch = cellHeight(p, cell);
  ctx.fillStyle = FABRIC;
  ctx.fillRect(0, 0, width * cell, height * ch);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = cells[y * width + x];
      if (c === EMPTY) continue;
      ctx.fillStyle = palette[c].hex;
      // Slight overdraw hides hairline seams between blocks at fractional sizes
      ctx.fillRect(x * cell, y * ch, cell + 0.5, ch + 0.5);
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
      ctx.moveTo(x * cell + cell * 0.2, y * ch + ch * 0.2);
      ctx.lineTo(x * cell + cell * 0.8, y * ch + ch * 0.8);
    }
  }
  ctx.stroke();
}

export function drawRealistic(ctx: CanvasRenderingContext2D, p: Pattern, cell: number, style: StitchStyle = "cross"): void {
  if (cell < SMOOTH_BELOW) {
    drawSmooth(ctx, p, cell);
    return;
  }
  const { width, height, cells, palette } = p;
  const ch = cellHeight(p, cell);
  ctx.fillStyle = style === "bead" ? "#e9e4d8" : style === "drill" ? "#d9d4c8" : FABRIC;
  ctx.fillRect(0, 0, width * cell, height * ch);
  const each = (fn: (x: number, y: number, c: number) => void) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = cells[y * width + x];
        if (c !== EMPTY) fn(x, y, c);
      }
    }
  };
  const light = palette.map((c) => shade(c.hex, 28));
  const dark = palette.map((c) => shade(c.hex, -26));

  if (style === "bead") {
    // Fuse beads seen from above: a ring with a hole.
    const r = cell * 0.46;
    each((x, y, c) => {
      const cx = x * cell + cell / 2;
      const cy = y * ch + ch / 2;
      ctx.fillStyle = palette[c].hex;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.arc(cx, cy, r * 0.38, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.strokeStyle = light[c];
      ctx.lineWidth = Math.max(1, cell * 0.08);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.7, Math.PI * 1.1, Math.PI * 1.6);
      ctx.stroke();
    });
    return;
  }
  if (style === "drill") {
    // Square diamond-painting drills with a faceted highlight.
    const g = cell * 0.06;
    each((x, y, c) => {
      const x0 = x * cell + g;
      const y0 = y * ch + g;
      const s = cell - g * 2;
      ctx.fillStyle = palette[c].hex;
      ctx.fillRect(x0, y0, s, ch - g * 2);
      ctx.fillStyle = light[c];
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + s, y0);
      ctx.lineTo(x0 + s * 0.5, y0 + (ch - g * 2) * 0.5);
      ctx.fill();
      ctx.fillStyle = dark[c];
      ctx.beginPath();
      ctx.moveTo(x0, y0 + ch - g * 2);
      ctx.lineTo(x0 + s, y0 + ch - g * 2);
      ctx.lineTo(x0 + s * 0.5, y0 + (ch - g * 2) * 0.5);
      ctx.fill();
    });
    return;
  }
  if (style === "block") {
    // Crochet squares: soft blocks with a little texture.
    each((x, y, c) => {
      ctx.fillStyle = palette[c].hex;
      ctx.fillRect(x * cell + 0.5, y * ch + 0.5, cell - 1, ch - 1);
      ctx.strokeStyle = dark[c];
      ctx.lineWidth = Math.max(1, cell * 0.08);
      ctx.beginPath();
      for (let k = 1; k < 3; k++) {
        ctx.moveTo(x * cell + cell * 0.15, y * ch + (ch * k) / 3);
        ctx.lineTo(x * cell + cell * 0.85, y * ch + (ch * k) / 3);
      }
      ctx.stroke();
    });
    return;
  }
  if (style === "knit") {
    // Stockinette: each stitch is a V of two legs.
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1.2, cell * 0.36);
    each((x, y, c) => {
      const x0 = x * cell;
      const y0 = y * ch;
      ctx.strokeStyle = dark[c];
      ctx.beginPath();
      ctx.moveTo(x0 + cell * 0.12, y0 + ch * 0.1);
      ctx.lineTo(x0 + cell * 0.5, y0 + ch * 0.9);
      ctx.stroke();
      ctx.strokeStyle = palette[c].hex;
      ctx.beginPath();
      ctx.moveTo(x0 + cell * 0.88, y0 + ch * 0.1);
      ctx.lineTo(x0 + cell * 0.5, y0 + ch * 0.9);
      ctx.stroke();
    });
    return;
  }

  // Cross stitch on Aida. Holes at stitch corners, once they are big enough to read as holes.
  if (cell >= 12) {
    ctx.fillStyle = "rgb(120 105 80 / 0.18)";
    const r = cell * 0.06;
    for (let y = 0; y <= height; y++) for (let x = 0; x <= width; x++) ctx.fillRect(x * cell - r, y * ch - r, r * 2, r * 2);
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
    each((x, y, c) => {
      const x0 = x * cell + inset;
      const y0 = y * ch + inset;
      const x1 = (x + 1) * cell - inset;
      const y1 = (y + 1) * ch - inset;
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
    });
  }
}

export function drawChart(ctx: CanvasRenderingContext2D, p: Pattern, cell: number, colour = true): void {
  const { width, height, cells, palette } = p;
  const ch = cellHeight(p, cell);
  const W = width * cell;
  const H = height * ch;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(Math.min(cell, ch) * 0.72)}px Helvetica, Arial, sans-serif`;
  const ink = palette.map((c) => (colour && isDark(c.hex) ? "#ffffff" : "#1a1a1a"));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = cells[y * width + x];
      if (c === EMPTY) continue;
      if (colour) {
        ctx.fillStyle = palette[c].hex;
        ctx.fillRect(x * cell, y * ch, cell, ch);
      }
      if (Math.min(cell, ch) >= 9) {
        ctx.fillStyle = ink[c];
        ctx.fillText(palette[c].symbol, x * cell + cell / 2, y * ch + ch / 2 + 1);
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
      ctx.moveTo(0, y * ch + 0.5);
      ctx.lineTo(W, y * ch + 0.5);
    }
    ctx.stroke();
  }
}
