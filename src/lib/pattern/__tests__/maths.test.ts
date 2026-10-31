import { describe, expect, it } from "vitest";
import { skeinsNeeded, STITCHES_PER_SKEIN } from "../skeins";
import { fabricToBuyCm, fabricToBuyInches, finishedSizeInches, inchesToCm } from "../fabric";

describe("skeins", () => {
  it("covers roughly 1,800 stitches per skein on 14-count", () => {
    expect(STITCHES_PER_SKEIN[14]).toBeGreaterThan(1700);
    expect(STITCHES_PER_SKEIN[14]).toBeLessThan(1950);
  });

  it("goes further on finer fabric", () => {
    expect(STITCHES_PER_SKEIN[11]).toBeLessThan(STITCHES_PER_SKEIN[14]);
    expect(STITCHES_PER_SKEIN[14]).toBeLessThan(STITCHES_PER_SKEIN[16]);
    expect(STITCHES_PER_SKEIN[16]).toBeLessThan(STITCHES_PER_SKEIN[18]);
  });

  it("rounds up and adds a 10% margin", () => {
    const per = STITCHES_PER_SKEIN[14];
    expect(skeinsNeeded(0, 14)).toBe(0);
    expect(skeinsNeeded(1, 14)).toBe(1);
    // Exactly one skein's worth needs a second skein once the 10% is added.
    expect(skeinsNeeded(per, 14)).toBe(2);
    expect(skeinsNeeded(Math.floor(per / 1.1), 14)).toBe(1);
  });
});

describe("fabric sizes", () => {
  it("works out finished size", () => {
    expect(finishedSizeInches(140, 14)).toBe(10);
    expect(finishedSizeInches(80, 16)).toBe(5);
    expect(inchesToCm(10)).toBeCloseTo(25.4, 6);
  });

  it("adds a 3 inch / 7.5 cm margin on every side", () => {
    expect(fabricToBuyInches(140, 14)).toBe(16);
    expect(fabricToBuyCm(140, 14)).toBeCloseTo(25.4 + 15, 6);
  });
});
