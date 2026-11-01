import type { FabricCount } from "./fabric";

// How far one skein of DMC stranded cotton goes.
//
// Assumptions (the usual ones for full cross stitch):
// - A DMC skein is 8 m of 6-strand floss. Stitching with 2 strands gives
//   3 working lengths, so 24 m (2400 cm) of 2-strand thread per skein.
// - One full cross is two diagonals on the front plus two short runs on
//   the back: about (2 * sqrt(2) + 2) = 4.83 stitch-widths of thread.
// - About 50% extra goes on tails, starting/ending and travelling between
//   areas, which is what stitchers' real-world counts suggest.
const THREAD_PER_SKEIN_CM = 800 * 3; // 8 m of 6 strands = 3 two-strand lengths
const THREAD_PER_STITCH_WIDTHS = 2 * Math.SQRT2 + 2;
const WASTE_FACTOR = 1.5;

/** Extra 10% so you don't run out on the last row. */
export const SKEIN_SAFETY_MARGIN = 0.1;

/** Full crosses one skein covers. More strands use the skein up faster (2 strands is the usual). */
export function stitchesPerSkein(count: number, strands = 2): number {
  const stitchWidthCm = 2.54 / count;
  const threadCm = THREAD_PER_SKEIN_CM * (2 / strands);
  return Math.floor(threadCm / (THREAD_PER_STITCH_WIDTHS * stitchWidthCm * WASTE_FACTOR));
}

/** Full cross stitches one skein covers, 2 strands, per fabric count. */
export const STITCHES_PER_SKEIN: Record<FabricCount, number> = {
  11: stitchesPerSkein(11), // ≈ 1,430
  14: stitchesPerSkein(14), // ≈ 1,820
  16: stitchesPerSkein(16), // ≈ 2,080
  18: stitchesPerSkein(18), // ≈ 2,340
};

export function skeinsNeeded(stitches: number, count: number, strands = 2): number {
  if (stitches <= 0) return 0;
  return Math.ceil((stitches * (1 + SKEIN_SAFETY_MARGIN)) / stitchesPerSkein(count, strands));
}
