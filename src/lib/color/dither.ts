import { nearestIndex } from "./ciede2000";

/**
 * Serpentine Floyd–Steinberg dithering in Lab against a fixed palette.
 * `lab` is the stitch grid as flat L,a,b triples; returns a palette index per cell.
 */
export function ditherLab(
  lab: Float32Array,
  width: number,
  height: number,
  palette: Float64Array,
  allowedFor?: (L: number, a: number, b: number) => Uint8Array | undefined,
): Int16Array {
  const buf = Float32Array.from(lab);
  const out = new Int16Array(width * height);
  const spread = (x: number, y: number, eL: number, ea: number, eb: number, w: number) => {
    if (x < 0 || x >= width || y >= height) return;
    const j = (y * width + x) * 3;
    buf[j] += eL * w;
    buf[j + 1] += ea * w;
    buf[j + 2] += eb * w;
  };
  for (let y = 0; y < height; y++) {
    const ltr = y % 2 === 0;
    const dir = ltr ? 1 : -1;
    for (let s = 0; s < width; s++) {
      const x = ltr ? s : width - 1 - s;
      const i = y * width + x;
      const L = buf[i * 3];
      const a = buf[i * 3 + 1];
      const b = buf[i * 3 + 2];
      const p = nearestIndex(L, a, b, palette, allowedFor?.(L, a, b));
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
