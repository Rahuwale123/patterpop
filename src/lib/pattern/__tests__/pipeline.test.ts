import { describe, expect, it } from "vitest";
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

describe("buildPattern", () => {
  it("produces a full grid with unique symbols, quickly", () => {
    const t0 = performance.now();
    const p = buildPattern(gradient(600, 600), 600, 600, DEFAULT_SETTINGS);
    const ms = performance.now() - t0;
    expect(p.width).toBe(80);
    expect(p.height).toBe(80);
    expect(p.palette.length).toBeGreaterThan(5);
    expect(p.palette.length).toBeLessThanOrEqual(20);
    expect(new Set(p.palette.map((c) => c.symbol)).size).toBe(p.palette.length);
    expect(p.palette.reduce((s, c) => s + c.count, 0)).toBe(80 * 80);
    expect(ms).toBeLessThan(3000);
  });
});
