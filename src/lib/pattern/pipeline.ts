import { nearestIndex } from "@/lib/color/ciede2000";
import { kmeans } from "@/lib/color/kmeans";
import { ditherLab } from "@/lib/color/dither";
import { clearLightBackground, EMPTY, removeStrayStitches } from "@/lib/color/cleanup";
import { DMC, DMC_LAB } from "./dmc";
import { gridHeight, resampleToLab } from "./grid";
import { assignSymbols } from "./symbols";

export type PatternSettings = {
  width: number;
  maxColours: number;
  dither: boolean;
  cleanup: boolean;
  skipWhiteBackground: boolean;
  seed: number;
};

export const DEFAULT_SETTINGS: PatternSettings = {
  width: 80,
  maxColours: 20,
  dither: false,
  cleanup: true,
  skipWhiteBackground: false,
  seed: 1,
};

export type PaletteEntry = {
  code: string;
  name: string;
  hex: string;
  symbol: string;
  count: number;
};

export type Pattern = {
  width: number;
  height: number;
  /** palette index per stitch, EMPTY (-1) for unstitched fabric */
  cells: Int16Array;
  palette: PaletteEntry[];
};

// "Leave white background unstitched" treats very light, nearly neutral floss as background.
const LIGHT_L = 90;
const LIGHT_CHROMA = 8;

export function buildPattern(
  rgba: Uint8ClampedArray,
  srcW: number,
  srcH: number,
  s: PatternSettings,
): Pattern {
  const width = s.width;
  const height = gridHeight(width, srcW, srcH);

  // 1–2. Area-average to the stitch grid, in Lab.
  const lab = resampleToLab(rgba, srcW, srcH, width, height);

  // 3. k-means++ in Lab down to N colours.
  const { centres } = kmeans(lab, s.maxColours, s.seed);

  // 4. Map each centre to its nearest DMC floss (CIEDE2000). Duplicates merge here.
  const dmcIdx = [...new Set(Array.from({ length: centres.length / 3 }, (_, c) =>
    nearestIndex(centres[c * 3], centres[c * 3 + 1], centres[c * 3 + 2], DMC_LAB),
  ))];
  const paletteLab = Float64Array.from(dmcIdx.flatMap((d) => DMC[d].lab));

  // Assign every stitch to the final DMC palette (5. optionally dithered).
  let cells: Int16Array;
  if (s.dither) {
    cells = ditherLab(lab, width, height, paletteLab);
  } else {
    cells = new Int16Array(width * height);
    for (let i = 0; i < cells.length; i++) {
      cells[i] = nearestIndex(lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2], paletteLab);
    }
  }

  // 6. Cleanup of isolated stitches.
  if (s.cleanup) cells = removeStrayStitches(cells, width, height);

  if (s.skipWhiteBackground) {
    cells = clearLightBackground(cells, width, height, (p) => {
      const [L, a, b] = DMC[dmcIdx[p]].lab;
      return L >= LIGHT_L && Math.hypot(a, b) <= LIGHT_CHROMA;
    });
  }

  return compactPalette(cells, dmcIdx, width, height);
}

/** Drop unused colours, sort by stitch count, and give each a unique symbol. */
function compactPalette(cells: Int16Array, dmcIdx: number[], width: number, height: number): Pattern {
  const counts = new Array<number>(dmcIdx.length).fill(0);
  for (const c of cells) if (c !== EMPTY) counts[c]++;
  const order = dmcIdx.map((_, i) => i).filter((i) => counts[i] > 0).sort((a, b) => counts[b] - counts[a]);
  const remap = new Int16Array(dmcIdx.length).fill(EMPTY);
  order.forEach((old, i) => (remap[old] = i));
  const out = cells.map((c) => (c === EMPTY ? EMPTY : remap[c]));
  const symbols = assignSymbols(order.length);
  const palette = order.map((old, i) => {
    const f = DMC[dmcIdx[old]];
    return { code: f.code, name: f.name, hex: f.hex, symbol: symbols[i], count: counts[old] };
  });
  return { width, height, cells: out, palette };
}
