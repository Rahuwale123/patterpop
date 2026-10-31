import { describe, expect, it } from "vitest";
import { hexToLab, rgbToLab } from "../lab";
import { isSkinLike, isSkinSafeThread } from "../skin";

describe("skin rules", () => {
  it("recognises a range of skin tones", () => {
    for (const rgb of [
      [255, 224, 196], // very light
      [224, 172, 140], // light
      [198, 134, 94], // medium
      [141, 85, 54], // deep
    ]) {
      const [L, a, b] = rgbToLab(rgb[0], rgb[1], rgb[2]);
      expect(isSkinLike(L, a, b, false), String(rgb)).toBe(true);
    }
  });

  it("only treats muted mauve as skin in portrait mode", () => {
    const [L, a, b] = [55, 14.4, -12.4]; // the shadowed-face cluster from the portrait sample (C 19, h 319)
    expect(isSkinLike(L, a, b, false)).toBe(false);
    expect(isSkinLike(L, a, b, true)).toBe(true);
  });

  it("never treats saturated purples, blues or greens as skin", () => {
    for (const hex of ["#8E5FB5", "#3355AA", "#4C8A3C"]) {
      const [L, a, b] = hexToLab(hex);
      expect(isSkinLike(L, a, b, true), hex).toBe(false);
    }
  });

  it("keeps purple, blue and grey threads away from skin", () => {
    const safe = (hex: string) => {
      const [L, a, b] = hexToLab(hex);
      return isSkinSafeThread(L, a, b);
    };
    expect(safe("#B79DA7")).toBe(false); // DMC 3042 Antique Violet Light
    expect(safe("#B7737F")).toBe(true); // DMC 316 Antique Mauve Med, a classic skin-shadow thread
    expect(safe("#ABABAB")).toBe(false); // grey
    expect(safe("#6B67A8")).toBe(false); // blue violet
    expect(safe("#FFD2B9")).toBe(true); // peach
    expect(safe("#D0A08A")).toBe(true); // dusty rose-brown
    expect(safe("#8A5A3C")).toBe(true); // brown
  });
});
