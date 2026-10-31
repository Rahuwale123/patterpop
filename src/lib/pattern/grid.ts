import { linearRgbToLab, srgbToLinear } from "@/lib/color/lab";

export const MIN_WIDTH = 30;
export const MAX_WIDTH = 150;

export function gridHeight(width: number, srcWidth: number, srcHeight: number): number {
  return Math.max(1, Math.round((width * srcHeight) / srcWidth));
}

/**
 * Area-average resample of RGBA pixels down to the stitch grid. Averaging is
 * done in linear light so dark/light edges blend the way the eye sees them.
 * Transparent pixels are treated as white fabric. Returns Lab triples per cell.
 */
export function resampleToLab(
  rgba: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  outW: number,
  outH: number,
): Float32Array {
  const lut = new Float32Array(256);
  for (let i = 0; i < 256; i++) lut[i] = srgbToLinear(i);

  const out = new Float32Array(outW * outH * 3);
  const sx = srcW / outW;
  const sy = srcH / outH;

  for (let oy = 0; oy < outH; oy++) {
    const y0 = oy * sy;
    const y1 = y0 + sy;
    for (let ox = 0; ox < outW; ox++) {
      const x0 = ox * sx;
      const x1 = x0 + sx;
      let r = 0;
      let g = 0;
      let b = 0;
      let wSum = 0;
      for (let py = Math.floor(y0); py < Math.min(srcH, Math.ceil(y1)); py++) {
        const wy = Math.min(py + 1, y1) - Math.max(py, y0);
        for (let px = Math.floor(x0); px < Math.min(srcW, Math.ceil(x1)); px++) {
          const w = wy * (Math.min(px + 1, x1) - Math.max(px, x0));
          const j = (py * srcW + px) * 4;
          const alpha = rgba[j + 3] / 255;
          r += w * (lut[rgba[j]] * alpha + (1 - alpha));
          g += w * (lut[rgba[j + 1]] * alpha + (1 - alpha));
          b += w * (lut[rgba[j + 2]] * alpha + (1 - alpha));
          wSum += w;
        }
      }
      const lab = linearRgbToLab(r / wSum, g / wSum, b / wSum);
      const o = (oy * outW + ox) * 3;
      out[o] = lab[0];
      out[o + 1] = lab[1];
      out[o + 2] = lab[2];
    }
  }
  return out;
}
