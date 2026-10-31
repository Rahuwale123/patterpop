import { describe, expect, it } from "vitest";
import { isSkinSafeThread } from "@/lib/color/skin";
import { hexToLab } from "@/lib/color/lab";
import { buildPattern, DEFAULT_SETTINGS } from "../pipeline";

function gradient(w: number, h: number): Uint8ClampedArray {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      px[i] = (x * 255) / w;
      px[i + 1] = (y * 255) / h;
      px[i + 2] = 128;
      px[i + 3] = 255;
    }
  return px;
}

/** A face-ish test card: warm skin with a cool mauve shadow down one side. */
function shadedSkin(w: number, h: number): Uint8ClampedArray {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const t = x / w;
      const rgb = t < 0.6 ? [224, 172, 140] : [150, 122, 148];
      px.set([rgb[0] - y * 0.05, rgb[1] - y * 0.05, rgb[2] - y * 0.05, 255], i);
    }
  return px;
}

describe("buildPattern", () => {
  it("fills the grid, gives unique symbols and meets the colour count", () => {
    const p = buildPattern(gradient(600, 600), 600, 600, DEFAULT_SETTINGS);
    expect(p.width).toBe(80);
    expect(p.height).toBe(80);
    expect(p.palette.length).toBe(20);
    expect(new Set(p.palette.map((c) => c.code)).size).toBe(20);
    expect(new Set(p.palette.map((c) => c.symbol)).size).toBe(p.palette.length);
    expect(p.palette.reduce((s, c) => s + c.count, 0)).toBe(80 * 80);
  });

  it("does not invent colours a flat image doesn't have", () => {
    const flat = new Uint8ClampedArray(200 * 200 * 4).fill(200);
    const p = buildPattern(flat, 200, 200, DEFAULT_SETTINGS);
    expect(p.palette.length).toBe(1);
  });

  it("keeps a mauve-shadowed face on warm threads in portrait mode", () => {
    const img = shadedSkin(300, 300);
    const p = buildPattern(img, 300, 300, { ...DEFAULT_SETTINGS, portrait: true, maxColours: 8 });
    for (const c of p.palette) {
      const [L, a, b] = hexToLab(c.hex);
      expect(isSkinSafeThread(L, a, b), `${c.code} ${c.name}`).toBe(true);
    }
    expect(p.faceLikely).toBe(true);
  });

  it("handles the largest pattern quickly", () => {
    const t0 = performance.now();
    const p = buildPattern(gradient(1600, 1200), 1600, 1200, { ...DEFAULT_SETTINGS, width: 150, maxColours: 40 });
    expect(p.width).toBe(150);
    expect(p.palette.length).toBe(40);
    expect(performance.now() - t0).toBeLessThan(5000);
  });
});
