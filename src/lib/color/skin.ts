// Skin-tone protection. Under coloured light, skin in shadow drifts towards
// mauve and grey, and DMC matching then picks lavender or steel threads that
// look wrong on a face. These rules keep skin on warm threads.

export function chromaHue(a: number, b: number): { C: number; h: number } {
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { C: Math.hypot(a, b), h: h < 0 ? h + 360 : h };
}

/**
 * Warm, moderately saturated colours that are very likely skin (all skin
 * tones sit roughly between red-orange and yellow in Lab). In portrait mode,
 * muted pinks and mauves count too: that's skin in shadow or under a cool cast.
 */
export function isSkinLike(L: number, a: number, b: number, portrait: boolean): boolean {
  const { C, h } = chromaHue(a, b);
  if (L >= 25 && L <= 95 && C >= 8 && C <= 45 && h >= 15 && h <= 75) return true;
  return portrait && L >= 30 && L <= 90 && C >= 6 && C <= 30 && (h >= 290 || h < 15);
}

/**
 * Threads allowed for skin: antique mauves, roses, corals, oranges, beiges and browns.
 * Excludes purple, blue and grey, including the dusty "antique violets" (around 350 degrees)
 * that otherwise turn shadowed skin lavender.
 */
export function isSkinSafeThread(L: number, a: number, b: number): boolean {
  const { C, h } = chromaHue(a, b);
  return C >= 8 && h <= 95;
}
