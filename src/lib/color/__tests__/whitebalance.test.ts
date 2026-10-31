import { describe, expect, it } from "vitest";
import { chromaHue } from "../skin";
import { correctPortrait, estimateSkinCast, SKIN_HUE } from "../whitebalance";

function grid(w: number, h: number, fill: (x: number, y: number) => [number, number, number]): Float32Array {
  const g = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g.set(fill(x, y), (y * w + x) * 3);
  return g;
}

describe("portrait white balance", () => {
  it("moves mauve-cast skin towards a natural skin hue, within the cap", () => {
    // The shadowed face from the portrait sample: hue ~320 instead of ~50.
    const g = grid(40, 40, () => [60, 14.4, -12.4]);
    const { da, db } = estimateSkinCast(g, 40, 40);
    expect(Math.hypot(da, db)).toBeLessThanOrEqual(6 + 1e-9);
    const out = correctPortrait(g, 40, 40, 0);
    const before = chromaHue(14.4, -12.4).h;
    const after = chromaHue(out[1], out[2]).h;
    const dist = (h: number) => Math.min(Math.abs(h - SKIN_HUE), 360 - Math.abs(h - SKIN_HUE));
    expect(dist(after)).toBeLessThan(dist(before));
    expect(out[0]).toBe(60); // lightness untouched
  });

  it("leaves a neutral photo alone", () => {
    const g = grid(40, 40, (x) => [x < 20 ? 30 : 85, 0, 0]);
    expect(estimateSkinCast(g, 40, 40)).toEqual({ da: 0, db: 0 });
    expect(Array.from(correctPortrait(g, 40, 40, 0))).toEqual(Array.from(g));
  });

  it("warmth only changes skin-like colours", () => {
    const g = grid(40, 40, (x) => (x < 20 ? [65, 15, 20] : [40, 10, -45])); // skin | blue
    const warm = correctPortrait(g, 40, 40, 1);
    const cool = correctPortrait(g, 40, 40, -1);
    const skin = 0;
    const blue = 30 * 3;
    expect(warm[skin + 2]).toBeGreaterThan(cool[skin + 2]);
    expect(warm[blue + 1]).toBeCloseTo(cool[blue + 1], 6);
    expect(warm[blue + 2]).toBeCloseTo(cool[blue + 2], 6);
  });
});

describe("portrait white balance limits", () => {
  it("does not touch skin that is already a natural hue, or add saturation", () => {
    const g = grid(40, 40, () => [65, 9, 12]); // hue ~53, low chroma, like the pug sample
    expect(estimateSkinCast(g, 40, 40)).toEqual({ da: 0, db: 0 });
  });
});
