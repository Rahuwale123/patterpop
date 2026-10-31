import { deltaE2000 } from "./ciede2000";

// Share of the colour error passed on to neighbours. Full Floyd–Steinberg (1)
// gives busy, speckled stitching; less keeps areas calmer.
const DITHER_STRENGTH = 0.7;

export type DitherOptions = {
  /** Limit the threads a stitch may use (e.g. warm threads for skin) */
  allowedFor?: (L: number, a: number, b: number, cell: number) => Uint8Array | undefined;
  /** Cells that keep `fixed[i]` and take no part in the dithering (background areas) */
  skip?: Uint8Array;
  fixed?: Int16Array;
};

/** The two allowed palette colours nearest to a Lab colour. */
function nearestTwo(L: number, a: number, b: number, palette: Float64Array, allowed?: Uint8Array): [number, number] {
  let i1 = -1;
  let i2 = -1;
  let d1 = Infinity;
  let d2 = Infinity;
  for (let i = 0, n = palette.length / 3; i < n; i++) {
    if (allowed && !allowed[i]) continue;
    const d = deltaE2000(L, a, b, palette[i * 3], palette[i * 3 + 1], palette[i * 3 + 2]);
    if (d < d1) {
      i2 = i1;
      d2 = d1;
      i1 = i;
      d1 = d;
    } else if (d < d2) {
      i2 = i;
      d2 = d;
    }
  }
  if (i1 < 0) return allowed ? nearestTwo(L, a, b, palette) : [0, 0];
  return [i1, i2 < 0 ? i1 : i2];
}

/**
 * Serpentine Floyd–Steinberg dithering in Lab against a fixed palette, tuned
 * for stitching: each stitch only chooses between the two threads nearest its
 * true colour (so a face mixes two skin shades, never a stray blue), and only
 * part of the error is passed on. `lab` is the stitch grid as L,a,b triples.
 */
export function ditherLab(
  lab: Float32Array,
  width: number,
  height: number,
  palette: Float64Array,
  opts: DitherOptions = {},
): Int16Array {
  const { allowedFor, skip, fixed } = opts;
  const buf = Float32Array.from(lab);
  const out = new Int16Array(width * height);
  const spread = (x: number, y: number, eL: number, ea: number, eb: number, w: number) => {
    if (x < 0 || x >= width || y >= height) return;
    const j = y * width + x;
    if (skip?.[j]) return;
    const k = w * DITHER_STRENGTH;
    buf[j * 3] += eL * k;
    buf[j * 3 + 1] += ea * k;
    buf[j * 3 + 2] += eb * k;
  };
  for (let y = 0; y < height; y++) {
    const ltr = y % 2 === 0;
    const dir = ltr ? 1 : -1;
    for (let s = 0; s < width; s++) {
      const x = ltr ? s : width - 1 - s;
      const i = y * width + x;
      if (skip?.[i]) {
        out[i] = fixed ? fixed[i] : 0;
        continue;
      }
      const [c1, c2] = nearestTwo(lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2], palette, allowedFor?.(lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2], i));
      const L = buf[i * 3];
      const a = buf[i * 3 + 1];
      const b = buf[i * 3 + 2];
      const d1 = deltaE2000(L, a, b, palette[c1 * 3], palette[c1 * 3 + 1], palette[c1 * 3 + 2]);
      const d2 = deltaE2000(L, a, b, palette[c2 * 3], palette[c2 * 3 + 1], palette[c2 * 3 + 2]);
      const p = d2 < d1 ? c2 : c1;
      out[i] = p;
      const eL = L - palette[p * 3];
      const ea = a - palette[p * 3 + 1];
      const eb = b - palette[p * 3 + 2];
      spread(x + dir, y, eL, ea, eb, 7 / 16);
      spread(x - dir, y + 1, eL, ea, eb, 3 / 16);
      spread(x, y + 1, eL, ea, eb, 5 / 16);
      spread(x + dir, y + 1, eL, ea, eb, 1 / 16);
    }
  }
  return out;
}
