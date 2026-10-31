import { describe, expect, it } from "vitest";
import { clearLightBackground, EMPTY, removeStrayStitches } from "../cleanup";

describe("removeStrayStitches", () => {
  it("replaces a lone stitch with its neighbours' colour", () => {
    const cells = Int16Array.from([0, 0, 0, 0, 1, 0, 0, 0, 0]);
    expect(Array.from(removeStrayStitches(cells, 3, 3))).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("clearLightBackground", () => {
  // 5x3: white (0) border, a fringe stitch (2) next to the subject (1), and a white highlight (0) inside.
  const cells = Int16Array.from([
    0, 0, 0, 0, 0,
    0, 2, 1, 0, 1,
    0, 0, 0, 0, 0,
  ]);
  const isLight = (p: number) => p === 0;

  it("clears white connected to the edge only", () => {
    const enclosed = Int16Array.from([0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0]);
    const out = clearLightBackground(enclosed, 5, 4, isLight);
    expect(out[12]).toBe(0); // white surrounded by the subject stays stitched
    expect(out[0]).toBe(EMPTY);
  });

  it("also clears pale fringe stitches touching the background, one deep", () => {
    const out = clearLightBackground(cells, 5, 3, isLight, (i) => cells[i] === 2);
    expect(out[6]).toBe(EMPTY); // fringe
    expect(out[7]).toBe(1); // subject untouched
  });
});
