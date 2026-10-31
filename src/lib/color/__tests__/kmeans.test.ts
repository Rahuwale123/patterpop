import { describe, expect, it } from "vitest";
import { kmeans } from "../kmeans";
import { mulberry32 } from "../random";

function cloud(seed: number, n: number): Float32Array {
  const r = mulberry32(seed);
  const centres = [[20, 10, -30], [60, -40, 20], [85, 5, 5]];
  const pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const c = centres[i % 3];
    for (let j = 0; j < 3; j++) pts[i * 3 + j] = c[j] + (r() - 0.5) * 6;
  }
  return pts;
}

describe("kmeans", () => {
  it("gives identical results for the same seed", () => {
    const pts = cloud(7, 900);
    const a = kmeans(pts, 5, 42);
    const b = kmeans(pts, 5, 42);
    expect(Array.from(a.centres)).toEqual(Array.from(b.centres));
    expect(Array.from(a.labels)).toEqual(Array.from(b.labels));
  });

  it("finds well-separated clusters", () => {
    const pts = cloud(3, 900);
    const { centres } = kmeans(pts, 3, 1);
    const found = Array.from({ length: 3 }, (_, i) => Math.round(centres[i * 3] / 5) * 5).sort((x, y) => x - y);
    expect(found).toEqual([20, 60, 85]);
  });

  it("never returns more centres than points", () => {
    const pts = new Float32Array([50, 0, 0, 60, 0, 0]);
    expect(kmeans(pts, 10, 1).centres.length).toBe(6);
  });
});
