import { deltaE2000, nearestIndex } from "@/lib/color/ciede2000";
import { kmeans } from "@/lib/color/kmeans";
import { ditherLab } from "@/lib/color/dither";
import { clearLightBackground, EMPTY, removeStrayStitches } from "@/lib/color/cleanup";
import { isSkinLike, isSkinSafeThread } from "@/lib/color/skin";
import { correctPortrait } from "@/lib/color/whitebalance";
import { DMC, DMC_LAB } from "./dmc";
import { gridHeight, resampleToLab } from "./grid";
import { assignSymbols } from "./symbols";

export type PatternSettings = {
  width: number;
  maxColours: number;
  dither: boolean;
  cleanup: boolean;
  skipWhiteBackground: boolean;
  /** Spend more colours on the middle of the photo and protect shadowed skin. */
  portrait: boolean;
  /** Portrait mode only: cooler (negative) to warmer (positive) skin, 0 = as corrected */
  skinWarmth: number;
  /** Give the outer area only a few threads, so more colours go to the subject. */
  simplifyBackground: boolean;
  seed: number;
};

export const DEFAULT_SETTINGS: PatternSettings = {
  width: 80,
  maxColours: 20,
  dither: false,
  cleanup: true,
  skipWhiteBackground: false,
  portrait: false,
  skinWarmth: 0,
  simplifyBackground: false,
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
  /** Lots of skin tones in the middle of the design, so probably a face */
  faceLikely?: boolean;
};

// "Leave white background unstitched" treats very light, nearly neutral floss as background.
const LIGHT_L = 90;
const LIGHT_CHROMA = 8;
// ...and pale edge stitches touching that background, where the photo blends into white.
const FRINGE_L = 78;
const FRINGE_CHROMA = 25;

// Portrait mode: stitches near the centre count up to this many times more when choosing colours.
const PORTRAIT_CENTRE_BOOST = 5;
const PORTRAIT_SIGMA = 0.28;

// Splitting a cluster to make up the colour count only happens if its two halves differ visibly.
const MIN_SPLIT_DE = 2.5;

// A design is "probably a face or pet" when this share of the central area is
// skin or warm-fur coloured. A colour heuristic, not face detection: it misses
// black or grey animals and can flag warm scenes like sand.
const FACE_SKIN_SHARE = 0.12;

// After cleanup removes rarely used threads, try this many times to restore the colour count.
const CLEANUP_TOP_UP_ROUNDS = 3;

// "Simplify background": the subject is the central ellipse (radii as a share of
// width and height); everything outside shares a small set of threads.
const SUBJECT_RX = 0.4;
const SUBJECT_RY = 0.46;
const backgroundColours = (k: number) => Math.max(2, Math.min(5, Math.round(k * 0.15)));
// Stitches inside the ellipse this close to a background thread count as background
// too, so the background doesn't change texture at the ellipse edge.
const BACKGROUND_LIKE_DE = 7;

function subjectMask(width: number, height: number): Uint8Array {
  const m = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = ((x + 0.5) / width - 0.5) / SUBJECT_RX;
      const dy = ((y + 0.5) / height - 0.5) / SUBJECT_RY;
      m[y * width + x] = dx * dx + dy * dy <= 1 ? 1 : 0;
    }
  }
  return m;
}

function gather(lab: Float32Array, idx: number[]): Float32Array {
  const out = new Float32Array(idx.length * 3);
  idx.forEach((p, j) => out.set(lab.subarray(p * 3, p * 3 + 3), j * 3));
  return out;
}

/** DMC threads that skin-like colours may map to. */
const SKIN_SAFE_DMC = Uint8Array.from(DMC, (f) => (isSkinSafeThread(f.lab[0], f.lab[1], f.lab[2]) ? 1 : 0));

function centreWeights(width: number, height: number): Float32Array {
  const w = new Float32Array(width * height);
  const s2 = 2 * PORTRAIT_SIGMA * PORTRAIT_SIGMA;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x + 0.5) / width - 0.5;
      const dy = (y + 0.5) / height - 0.5;
      w[y * width + x] = 1 + (PORTRAIT_CENTRE_BOOST - 1) * Math.exp(-(dx * dx + dy * dy) / s2);
    }
  }
  return w;
}

function and(a: Uint8Array, b: Uint8Array): Uint8Array {
  return a.map((v, i) => v & b[i]);
}

/** Nearest DMC to a colour, keeping skin on warm threads and optionally skipping threads already used. */
function matchDmc(L: number, a: number, b: number, portrait: boolean, exclude?: Uint8Array): number {
  let allowed: Uint8Array | undefined = isSkinLike(L, a, b, portrait) ? SKIN_SAFE_DMC : undefined;
  if (exclude) {
    const free = exclude.map((v) => 1 - v);
    allowed = allowed ? and(allowed, free) : free;
  }
  return nearestIndex(L, a, b, DMC_LAB, allowed);
}

export function buildPattern(rgba: Uint8ClampedArray, srcW: number, srcH: number, s: PatternSettings): Pattern {
  const width = s.width;
  const height = gridHeight(width, srcW, srcH);
  const n = width * height;
  const portrait = s.portrait;

  // 1–2. Area-average to the stitch grid, in Lab. Portrait mode corrects a
  // colour cast on the skin first, so the colours are right before quantising.
  const raw = resampleToLab(rgba, srcW, srcH, width, height);
  const lab = portrait ? correctPortrait(raw, width, height, s.skinWarmth) : raw;
  const weights = portrait ? centreWeights(width, height) : undefined;

  // 3–4. k-means++ in Lab with CIEDE2000, then map each cluster to DMC
  // (clusters that land on the same thread merge). With "Simplify background"
  // the outer area is clustered on its own into a few threads.
  const toDmc = (c: Float64Array) =>
    Array.from({ length: c.length / 3 }, (_, j) => matchDmc(c[j * 3], c[j * 3 + 1], c[j * 3 + 2], portrait));
  // `inner` ends up 1 for subject stitches and 0 for background ones.
  const inner = s.simplifyBackground ? subjectMask(width, height) : undefined;
  let centreDmc: number[];
  let bgThreads: Set<number> | undefined;
  if (inner) {
    const outerIdx: number[] = [];
    for (let i = 0; i < n; i++) if (!inner[i]) outerIdx.push(i);
    bgThreads = new Set(toDmc(kmeans(gather(lab, outerIdx), backgroundColours(s.maxColours), s.seed, 30).centres));
    const bgLab = [...bgThreads].map((d) => DMC[d].lab);
    const innerIdx: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!inner[i]) continue;
      const near = bgLab.some((f) => deltaE2000(lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2], f[0], f[1], f[2]) < BACKGROUND_LIKE_DE);
      if (near) inner[i] = 0;
      else innerIdx.push(i);
    }
    const fgWeights = weights ? Float32Array.from(innerIdx, (i) => weights[i]) : undefined;
    const fgK = Math.max(1, s.maxColours - bgThreads.size);
    centreDmc = innerIdx.length ? [...bgThreads, ...toDmc(kmeans(gather(lab, innerIdx), fgK, s.seed, 30, fgWeights).centres)] : [...bgThreads];
  } else {
    centreDmc = toDmc(kmeans(lab, s.maxColours, s.seed, 30, weights).centres);
  }

  // 5. Give every stitch its nearest thread. Skin-like stitches stay on warm threads.
  const threads = [...new Set(centreDmc)];
  const cells = new Int16Array(n);
  const bestD = new Float64Array(n);
  const skinStitch = Uint8Array.from({ length: n }, (_, i) => (isSkinLike(lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2], portrait) ? 1 : 0));
  const tryThread = (i: number, t: number): boolean => {
    if (skinStitch[i] && !SKIN_SAFE_DMC[threads[t]]) return false;
    if (inner && bgThreads && !inner[i] && !bgThreads.has(threads[t])) return false;
    const f = DMC[threads[t]].lab;
    const d = deltaE2000(lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2], f[0], f[1], f[2]);
    if (d >= bestD[i]) return false;
    bestD[i] = d;
    cells[i] = t;
    return true;
  };
  bestD.fill(Infinity);
  for (let i = 0; i < n; i++) {
    for (let t = 0; t < threads.length; t++) tryThread(i, t);
    if (bestD[i] === Infinity) {
      // Nothing warm in the palette: fall back to the plain nearest thread.
      skinStitch[i] = 0;
      for (let t = 0; t < threads.length; t++) tryThread(i, t);
    }
  }

  // 5b. Merges can leave fewer colours than asked for. Split the busiest thread
  // in two until the count matches, as long as the two halves look different.
  // Adding a thread can only pull stitches towards it, so only that needs checking.
  const unsplittable = new Set<number>();
  const used = () => new Set(cells).size;
  const splitUntilCount = () => {
    for (let guard = 0; used() < s.maxColours && guard < s.maxColours * 3; guard++) {
      const mass = new Float64Array(threads.length);
      for (let i = 0; i < n; i++) mass[cells[i]] += weights ? weights[i] : 1;
      let target = -1;
      for (let t = 0; t < threads.length; t++) {
        if (!unsplittable.has(t) && mass[t] > 1 && (target < 0 || mass[t] > mass[target])) target = t;
      }
      if (target < 0) break;
      const pts: number[] = [];
      for (let i = 0; i < n; i++) if (cells[i] === target) pts.push(i);
      const sub = new Float32Array(pts.length * 3);
      pts.forEach((p, j) => sub.set(lab.subarray(p * 3, p * 3 + 3), j * 3));
      const split = kmeans(sub, 2, s.seed + guard + 1, 20, weights ? Float32Array.from(pts, (p) => weights[p]) : undefined);
      const c = split.centres;
      if (c.length < 6 || deltaE2000(c[0], c[1], c[2], c[3], c[4], c[5]) < MIN_SPLIT_DE) {
        unsplittable.add(target);
        continue;
      }
      // The half further from the current thread gets a new one.
      const cur = DMC[threads[target]].lab;
      const far = deltaE2000(c[3], c[4], c[5], cur[0], cur[1], cur[2]) > deltaE2000(c[0], c[1], c[2], cur[0], cur[1], cur[2]) ? 1 : 0;
      const taken = new Uint8Array(DMC.length);
      for (const t of threads) taken[t] = 1;
      const fresh = matchDmc(c[far * 3], c[far * 3 + 1], c[far * 3 + 2], portrait, taken);
      if (taken[fresh]) {
        unsplittable.add(target);
        continue;
      }
      threads.push(fresh);
      let moved = 0;
      for (let i = 0; i < n; i++) if (tryThread(i, threads.length - 1)) moved++;
      if (moved === 0) unsplittable.add(target);
    }
  };
  splitUntilCount();

  // Drop threads that ended up with no stitches, so nothing below (dithering in
  // particular) can bring them back and go over the colour count.
  const usedThreads = [...new Set(cells)].sort((x, y) => x - y);
  const remap = new Int16Array(threads.length).fill(EMPTY);
  usedThreads.forEach((t, j) => (remap[t] = j));
  for (let i = 0; i < n; i++) cells[i] = remap[cells[i]];
  // Renumber in place: the cleanup top-up below keeps using `threads` and `unsplittable`.
  const kept = usedThreads.map((t) => threads[t]);
  threads.length = 0;
  threads.push(...kept);
  const stillUnsplittable = [...unsplittable].filter((t) => remap[t] !== EMPTY).map((t) => remap[t]);
  unsplittable.clear();
  stillUnsplittable.forEach((t) => unsplittable.add(t));
  const dmcIdx = threads;

  const isLightThread = (p: number) => {
    const [L, a, b] = DMC[dmcIdx[p]].lab;
    return L >= LIGHT_L && Math.hypot(a, b) <= LIGHT_CHROMA;
  };
  // Edge stitches that are mostly background blended with the subject
  const isFringe = (i: number) => lab[i * 3] >= FRINGE_L && Math.hypot(lab[i * 3 + 1], lab[i * 3 + 2]) <= FRINGE_CHROMA;

  let out: Int16Array = cells;
  if (s.dither) {
    // Background areas (a cleared white background, or the simplified outer
    // area) aren't dithered: they stay calm and keep their plain threads.
    const fixed = s.skipWhiteBackground ? clearLightBackground(cells, width, height, isLightThread, isFringe) : cells;
    const skip = Uint8Array.from(fixed, (v, i) => (v === EMPTY || (inner && !inner[i]) ? 1 : 0));
    const paletteLab = Float64Array.from(dmcIdx.flatMap((d) => DMC[d].lab));
    const paletteSkinSafe = Uint8Array.from(dmcIdx, (d) => SKIN_SAFE_DMC[d]);
    out = ditherLab(lab, width, height, paletteLab, {
      skip,
      fixed,
      allowedFor: (L, a, b) => (isSkinLike(L, a, b, portrait) ? paletteSkinSafe : undefined),
    });
  }

  // 6. Cleanup of isolated stitches. A thread used only for scattered single
  // stitches disappears here, so top the count back up from solid areas.
  if (s.cleanup) {
    out = removeStrayStitches(out, width, height);
    for (let round = 0; !s.dither && round < CLEANUP_TOP_UP_ROUNDS && new Set(out).size < s.maxColours; round++) {
      cells.set(out);
      splitUntilCount();
      out = removeStrayStitches(cells, width, height);
    }
  }

  if (s.skipWhiteBackground) {
    out = clearLightBackground(out, width, height, isLightThread, isFringe);
  }

  return { ...compactPalette(out, dmcIdx, width, height), faceLikely: centreSkinShare(raw, width, height) >= FACE_SKIN_SHARE };
}

function centreSkinShare(lab: Float32Array, width: number, height: number): number {
  let skin = 0;
  let total = 0;
  for (let y = Math.floor(height * 0.2); y < Math.ceil(height * 0.8); y++) {
    for (let x = Math.floor(width * 0.25); x < Math.ceil(width * 0.75); x++) {
      const i = y * width + x;
      total++;
      if (isSkinLike(lab[i * 3], lab[i * 3 + 1], lab[i * 3 + 2], false)) skin++;
    }
  }
  return total ? skin / total : 0;
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
