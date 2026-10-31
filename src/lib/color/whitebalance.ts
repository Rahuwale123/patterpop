import { chromaHue, isSkinLike } from "./skin";

// Portrait-mode colour correction, applied to the stitch grid (Lab triples)
// before quantising. Fixes the cause of odd skin (a colour cast in the photo)
// rather than only steering the thread choice afterwards.

/** Typical skin hue in Lab, in degrees (between red-orange and yellow). */
export const SKIN_HUE = 50;
/** Natural skin hues. Skin already in this range is left alone by white balance. */
const SKIN_HUE_LO = 25;
const SKIN_HUE_HI = 65;
/**
 * Largest white-balance shift, in Lab a/b units. White balance moves every
 * colour, so it stays modest; the skin-only nudge does the rest.
 */
const MAX_CAST_SHIFT = 6;
/** Largest hue nudge for skin-like colours after white balance, in degrees. */
const MAX_SKIN_NUDGE = 12;
/** Need at least this share of the centre to look like skin before trusting the estimate. */
const MIN_SKIN_SHARE = 0.05;
/** Warmth step per slider unit, in Lab a/b, applied to skin-like colours only. */
const WARMTH_A = 1;
const WARMTH_B = 6;

export const SKIN_WARMTH_MIN = -2;
export const SKIN_WARMTH_MAX = 2;

/**
 * Candidate skin under a cast: mid lightness, some colour, hue from mauve to
 * orange. Yellows are left out so fields, sand or blonde hair don't skew it.
 */
function maybeSkin(L: number, a: number, b: number): boolean {
  const { C, h } = chromaHue(a, b);
  return L >= 35 && L <= 92 && C >= 5 && C <= 35 && (h >= 280 || h <= 70);
}

/** Signed shortest turn from hue `from` to hue `to`, in degrees. */
function hueTurn(from: number, to: number): number {
  let d = to - from;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * Estimate the colour cast from likely skin in the centre of the design.
 * Returns the a/b shift that moves that skin to a natural skin hue, capped.
 */
export function estimateSkinCast(lab: Float32Array, width: number, height: number): { da: number; db: number } {
  let sa = 0;
  let sb = 0;
  let n = 0;
  let total = 0;
  for (let y = Math.floor(height * 0.15); y < Math.ceil(height * 0.85); y++) {
    for (let x = Math.floor(width * 0.2); x < Math.ceil(width * 0.8); x++) {
      const i = (y * width + x) * 3;
      total++;
      if (!maybeSkin(lab[i], lab[i + 1], lab[i + 2])) continue;
      sa += lab[i + 1];
      sb += lab[i + 2];
      n++;
    }
  }
  if (n === 0 || n / total < MIN_SKIN_SHARE) return { da: 0, db: 0 };
  const a = sa / n;
  const b = sb / n;
  // Rotate the skin hue into the natural range, keeping its saturation.
  const { C, h } = chromaHue(a, b);
  if (h >= SKIN_HUE_LO && h <= SKIN_HUE_HI) return { da: 0, db: 0 };
  const toLo = hueTurn(h, SKIN_HUE_LO);
  const toHi = hueTurn(h, SKIN_HUE_HI);
  const target = Math.abs(toLo) <= Math.abs(toHi) ? SKIN_HUE_LO : SKIN_HUE_HI;
  const ta = C * Math.cos((target * Math.PI) / 180);
  const tb = C * Math.sin((target * Math.PI) / 180);
  let da = ta - a;
  let db = tb - b;
  const len = Math.hypot(da, db);
  if (len > MAX_CAST_SHIFT) {
    da *= MAX_CAST_SHIFT / len;
    db *= MAX_CAST_SHIFT / len;
  }
  return { da, db };
}

/** Rotate a hue towards SKIN_HUE by at most MAX_SKIN_NUDGE degrees. */
function nudgeHue(a: number, b: number): [number, number] {
  const { C, h } = chromaHue(a, b);
  const diff = hueTurn(h, SKIN_HUE);
  const step = Math.max(-MAX_SKIN_NUDGE, Math.min(MAX_SKIN_NUDGE, diff));
  const nh = ((h + step) * Math.PI) / 180;
  return [C * Math.cos(nh), C * Math.sin(nh)];
}

/**
 * White balance from the skin estimate, then a small hue nudge and the
 * user's warmth setting on skin-like colours only. Returns a new grid.
 */
export function correctPortrait(lab: Float32Array, width: number, height: number, warmth: number): Float32Array {
  const { da, db } = estimateSkinCast(lab, width, height);
  const out = new Float32Array(lab.length);
  for (let i = 0; i < lab.length; i += 3) {
    const L = lab[i];
    let a = lab[i + 1] + da;
    let b = lab[i + 2] + db;
    if (isSkinLike(L, a, b, true)) {
      [a, b] = nudgeHue(a, b);
      a += warmth * WARMTH_A;
      b += warmth * WARMTH_B;
    }
    out[i] = L;
    out[i + 1] = a;
    out[i + 2] = b;
  }
  return out;
}
