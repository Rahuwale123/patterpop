import { describe, expect, it } from "vitest";
import { buildPattern, DEFAULT_SETTINGS } from "../pipeline";
import { brandPalette, describeColour } from "../palettes";

function photo(w: number, h: number): Uint8ClampedArray {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) px.set([(x * 255) / w, (y * 255) / h, 90 + ((x + y) % 60), 255], (y * w + x) * 4);
  return px;
}

describe("palettes for other crafts", () => {
  it("only uses Perler beads for the Perler palette", () => {
    const codes = new Set(brandPalette("perler").colours.map((c) => c.code));
    const p = buildPattern(photo(300, 300), 300, 300, { ...DEFAULT_SETTINGS, palette: "perler", width: 40, maxColours: 15 });
    expect(p.palette.length).toBe(15);
    expect(p.palette.every((c) => codes.has(c.code))).toBe(true);
  });

  it("keeps the photo's own colours for yarn, numbered 1..n with plain names", () => {
    const p = buildPattern(photo(300, 300), 300, 300, { ...DEFAULT_SETTINGS, palette: "free", width: 40, maxColours: 8 });
    expect(p.palette.length).toBe(8);
    expect(p.palette.map((c) => c.code)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(p.palette.every((c) => /^[A-Z][a-z]/.test(c.name) && /^#[0-9A-F]{6}$/.test(c.hex))).toBe(true);
  });

  it("makes more rows when cells are wider than tall (knitting)", () => {
    const square = buildPattern(photo(300, 300), 300, 300, { ...DEFAULT_SETTINGS, palette: "free", width: 40, maxColours: 6 });
    const knit = buildPattern(photo(300, 300), 300, 300, { ...DEFAULT_SETTINGS, palette: "free", width: 40, maxColours: 6, cellAspect: 22 / 30 });
    expect(square.height).toBe(40);
    expect(knit.height).toBe(Math.round(40 / (22 / 30)));
    expect(knit.cellAspect).toBeCloseTo(22 / 30, 6);
  });

  it("names colours in plain words", () => {
    expect(describeColour(25, 0, 0)).toBe("Dark grey");
    expect(describeColour(97, 0, 0)).toBe("White");
    expect(describeColour(45, 60, 40)).toMatch(/red/i);
    expect(describeColour(50, -50, 40)).toMatch(/green|olive/i);
  });
});
