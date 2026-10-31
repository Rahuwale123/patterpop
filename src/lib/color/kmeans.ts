import { deltaE2000 } from "./ciede2000";
import { mulberry32 } from "./random";

export type KMeansResult = {
  /** k centres as flat L,a,b triples */
  centres: Float64Array;
  /** cluster index for each input point */
  labels: Int32Array;
};

// CIEDE2000 is slow to evaluate for every point/centre pair, so each point
// first shortlists its nearest centres by plain Lab distance, then picks the
// best of those by CIEDE2000. The true CIEDE2000 nearest is almost always on
// a shortlist of this size.
const SHORTLIST = 4;

function de(p: Float32Array, i: number, c: Float64Array, j: number): number {
  return deltaE2000(p[i * 3], p[i * 3 + 1], p[i * 3 + 2], c[j * 3], c[j * 3 + 1], c[j * 3 + 2]);
}

function nearestCentre(p: Float32Array, i: number, c: Float64Array, k: number, shortD: Float64Array, shortI: Int32Array): number {
  const m = Math.min(SHORTLIST, k);
  shortD.fill(Infinity);
  for (let j = 0; j < k; j++) {
    const dL = p[i * 3] - c[j * 3];
    const da = p[i * 3 + 1] - c[j * 3 + 1];
    const db = p[i * 3 + 2] - c[j * 3 + 2];
    const d = dL * dL + da * da + db * db;
    if (d >= shortD[m - 1]) continue;
    let s = m - 1;
    while (s > 0 && shortD[s - 1] > d) {
      shortD[s] = shortD[s - 1];
      shortI[s] = shortI[s - 1];
      s--;
    }
    shortD[s] = d;
    shortI[s] = j;
  }
  let best = shortI[0];
  let bestD = Infinity;
  for (let s = 0; s < m; s++) {
    const d = de(p, i, c, shortI[s]);
    if (d < bestD) {
      bestD = d;
      best = shortI[s];
    }
  }
  return best;
}

/**
 * Weighted k-means in Lab with k-means++ seeding, using CIEDE2000 as the
 * distance (the same metric used later to match DMC floss). Centres are the
 * weighted Lab mean of their points. `weights` lets some pixels count more,
 * e.g. the centre of a portrait.
 */
export function kmeans(points: Float32Array, k: number, seed = 1, maxIter = 30, weights?: Float32Array): KMeansResult {
  const n = points.length / 3;
  const kk = Math.max(1, Math.min(k, n));
  const w = (i: number) => (weights ? weights[i] : 1);
  const rand = mulberry32(seed);
  const centres = new Float64Array(kk * 3);
  const labels = new Int32Array(n);

  // k-means++ initialisation, weighted by squared CIEDE2000 distance
  let first = 0;
  {
    let total = 0;
    for (let i = 0; i < n; i++) total += w(i);
    let r = rand() * total;
    for (let i = 0; i < n; i++) {
      r -= w(i);
      if (r <= 0) {
        first = i;
        break;
      }
    }
  }
  centres.set(points.subarray(first * 3, first * 3 + 3), 0);
  const d2 = new Float64Array(n).fill(Infinity);
  for (let c = 1; c < kk; c++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const d = de(points, i, centres, c - 1);
      if (d * d < d2[i]) d2[i] = d * d;
      sum += d2[i] * w(i);
    }
    let pick = n - 1;
    if (sum > 0) {
      let r = rand() * sum;
      for (let i = 0; i < n; i++) {
        r -= d2[i] * w(i);
        if (r <= 0) {
          pick = i;
          break;
        }
      }
    } else {
      pick = Math.floor(rand() * n);
    }
    centres.set(points.subarray(pick * 3, pick * 3 + 3), c * 3);
  }

  // Lloyd iterations
  const sums = new Float64Array(kk * 3);
  const mass = new Float64Array(kk);
  const shortD = new Float64Array(SHORTLIST);
  const shortI = new Int32Array(SHORTLIST);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = 0;
    for (let i = 0; i < n; i++) {
      const best = nearestCentre(points, i, centres, kk, shortD, shortI);
      if (labels[i] !== best || iter === 0) changed++;
      labels[i] = best;
    }
    sums.fill(0);
    mass.fill(0);
    for (let i = 0; i < n; i++) {
      const c = labels[i];
      const wi = w(i);
      mass[c] += wi;
      sums[c * 3] += points[i * 3] * wi;
      sums[c * 3 + 1] += points[i * 3 + 1] * wi;
      sums[c * 3 + 2] += points[i * 3 + 2] * wi;
    }
    for (let c = 0; c < kk; c++) {
      if (mass[c] === 0) continue; // keep an empty centre where it was
      centres[c * 3] = sums[c * 3] / mass[c];
      centres[c * 3 + 1] = sums[c * 3 + 1] / mass[c];
      centres[c * 3 + 2] = sums[c * 3 + 2] / mass[c];
    }
    if (changed === 0) break;
  }

  return { centres, labels };
}
