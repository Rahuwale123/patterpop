import { mulberry32 } from "./random";

export type KMeansResult = {
  /** k centres as flat L,a,b triples */
  centres: Float64Array;
  /** cluster index for each input point */
  labels: Int32Array;
};

function dist2(p: Float32Array, i: number, c: Float64Array, j: number): number {
  const dL = p[i * 3] - c[j * 3];
  const da = p[i * 3 + 1] - c[j * 3 + 1];
  const db = p[i * 3 + 2] - c[j * 3 + 2];
  return dL * dL + da * da + db * db;
}

/**
 * k-means in Lab space with k-means++ seeding. Euclidean distance here is CIE76,
 * which is fine for clustering; the perceptual CIEDE2000 step comes after, when
 * centres are mapped to DMC floss.
 */
export function kmeans(points: Float32Array, k: number, seed = 1, maxIter = 30): KMeansResult {
  const n = points.length / 3;
  const kk = Math.max(1, Math.min(k, n));
  const rand = mulberry32(seed);
  const centres = new Float64Array(kk * 3);
  const labels = new Int32Array(n);

  // k-means++ initialisation
  const first = Math.floor(rand() * n);
  centres.set(points.subarray(first * 3, first * 3 + 3), 0);
  const d2 = new Float64Array(n).fill(Infinity);
  for (let c = 1; c < kk; c++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const d = dist2(points, i, centres, c - 1);
      if (d < d2[i]) d2[i] = d;
      sum += d2[i];
    }
    let pick = n - 1;
    if (sum > 0) {
      let r = rand() * sum;
      for (let i = 0; i < n; i++) {
        r -= d2[i];
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
  const counts = new Int32Array(kk);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = 0;
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < kk; c++) {
        const d = dist2(points, i, centres, c);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (labels[i] !== best || iter === 0) changed++;
      labels[i] = best;
    }
    sums.fill(0);
    counts.fill(0);
    for (let i = 0; i < n; i++) {
      const c = labels[i];
      counts[c]++;
      sums[c * 3] += points[i * 3];
      sums[c * 3 + 1] += points[i * 3 + 1];
      sums[c * 3 + 2] += points[i * 3 + 2];
    }
    for (let c = 0; c < kk; c++) {
      if (counts[c] === 0) continue; // keep an empty centre where it was
      centres[c * 3] = sums[c * 3] / counts[c];
      centres[c * 3 + 1] = sums[c * 3 + 1] / counts[c];
      centres[c * 3 + 2] = sums[c * 3 + 2] / counts[c];
    }
    if (changed === 0) break;
  }

  return { centres, labels };
}
