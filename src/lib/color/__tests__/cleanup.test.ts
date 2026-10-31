import { describe, expect, it } from "vitest";
import { clearLightBackground, EMPTY, removeStrayStitches } from "../cleanup";

describe("removeStrayStitches", () => {
  it("replaces a lone stitch with its neighbours' colour", () => {
    const cells = Int16Array.from([0, 0, 0, 0, 1, 0, 0, 0, 0]);
    expect(Array.from(removeStrayStitches(cells, 3, 3))).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("clearLightBackground", () => {
  const isLight = (p: number) => p === 0;

  it("clears white connected to the edge only", () => {
    const enclosed = Int16Array.from([0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0]);
    const out = clearLightBackground(enclosed, 5, 4, isLight);
    expect(out[12]).toBe(0); // white surrounded by the subject stays stitched
    expect(out[0]).toBe(EMPTY);
  });

  it("also clears pale fringe stitches touching the background, one deep", () => {
    // 6x4: white border, a 2x2 subject (1) with a pale fringe stitch (2) on its left
    const g = Int16Array.from([
      0, 0, 0, 0, 0, 0,
      0, 2, 1, 1, 0, 0,
      0, 0, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0,
    ]);
    const out = clearLightBackground(g, 6, 4, isLight, (i) => g[i] === 2);
    expect(out[7]).toBe(EMPTY); // fringe
    expect([out[8], out[9], out[14], out[15]]).toEqual([1, 1, 1, 1]); // subject untouched
  });

  it("removes a single stranded stitch but keeps a one-stitch-wide line", () => {
    // 7x5: a lone stitch at (1,2) and a vertical line at x=4
    const g = new Int16Array(35);
    g[2 * 7 + 1] = 1;
    for (let y = 1; y < 4; y++) g[y * 7 + 4] = 1;
    const out = clearLightBackground(g, 7, 5, isLight);
    expect(out[2 * 7 + 1]).toBe(EMPTY);
    expect([out[7 + 4], out[14 + 4], out[21 + 4]]).toEqual([1, 1, 1]);
  });
});
