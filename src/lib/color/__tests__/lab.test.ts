import { describe, expect, it } from "vitest";
import { hexToLab, labToRgb, rgbToLab } from "../lab";

describe("rgbToLab (sRGB, D65)", () => {
  it.each([
    [[255, 255, 255], [100, 0, 0]],
    [[0, 0, 0], [0, 0, 0]],
    [[255, 0, 0], [53.2408, 80.0925, 67.2032]],
    [[0, 255, 0], [87.7347, -86.1827, 83.1793]],
    [[0, 0, 255], [32.2970, 79.1875, -107.8602]],
    [[128, 128, 128], [53.5850, 0, 0]],
  ])("%j -> %j", (rgb, expected) => {
    const lab = rgbToLab(rgb[0], rgb[1], rgb[2]);
    lab.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 2));
  });

  it("round-trips through labToRgb", () => {
    for (const hex of ["#9B2C23", "#2C3E6B", "#C4922A", "#F7F3EA"]) {
      const [L, a, b] = hexToLab(hex);
      const back = labToRgb(L, a, b).map((v) => v.toString(16).padStart(2, "0")).join("");
      expect(`#${back.toUpperCase()}`).toBe(hex);
    }
  });
});
