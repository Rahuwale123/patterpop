export const EMPTY = -1;

/**
 * Replace isolated single stitches (no matching colour among the 8 neighbours)
 * with the most common neighbouring colour. Reads from the original grid so the
 * result doesn't depend on scan order.
 */
export function removeStrayStitches(cells: Int16Array, width: number, height: number): Int16Array {
  const out = Int16Array.from(cells);
  const tally = new Map<number, number>();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = cells[y * width + x];
      tally.clear();
      let alone = true;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const n = cells[ny * width + nx];
          if (n === v) {
            alone = false;
            break;
          }
          tally.set(n, (tally.get(n) ?? 0) + 1);
        }
        if (!alone) break;
      }
      if (!alone || tally.size === 0) continue;
      let best = v;
      let bestN = 0;
      for (const [c, n] of tally) {
        if (n > bestN) {
          bestN = n;
          best = c;
        }
      }
      out[y * width + x] = best;
    }
  }
  return out;
}

/**
 * Mark near-white cells connected to the edge of the design as unstitched, so a
 * white background is left as bare fabric. `isLight(p)` says whether palette entry p counts.
 * `isFringe(i)`, if given, also clears cell i when it touches the cleared background
 * (one stitch deep), for pale stitches where the subject blends into the white.
 */
export function clearLightBackground(
  cells: Int16Array,
  width: number,
  height: number,
  isLight: (paletteIndex: number) => boolean,
  isFringe?: (cellIndex: number) => boolean,
): Int16Array {
  const out = Int16Array.from(cells);
  const stack: number[] = [];
  const push = (i: number) => {
    if (out[i] !== EMPTY && isLight(out[i])) {
      out[i] = EMPTY;
      stack.push(i);
    }
  };
  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + width - 1);
  }
  while (stack.length) {
    const i = stack.pop() as number;
    const x = i % width;
    const y = (i - x) / width;
    if (x > 0) push(i - 1);
    if (x < width - 1) push(i + 1);
    if (y > 0) push(i - width);
    if (y < height - 1) push(i + width);
  }
  if (isFringe) {
    const fringe: number[] = [];
    for (let i = 0; i < out.length; i++) {
      if (out[i] === EMPTY || !isFringe(i)) continue;
      const x = i % width;
      const touches =
        (x > 0 && out[i - 1] === EMPTY) ||
        (x < width - 1 && out[i + 1] === EMPTY) ||
        (i >= width && out[i - width] === EMPTY) ||
        (i + width < out.length && out[i + width] === EMPTY);
      if (touches) fringe.push(i);
    }
    for (const i of fringe) out[i] = EMPTY;
  }
  // Single stitches stranded in the cleared background (all 8 neighbours bare).
  // Thin lines (6 bare neighbours) are real detail and stay.
  const stranded: number[] = [];
  for (let i = 0; i < out.length; i++) {
    if (out[i] === EMPTY) continue;
    const x = i % width;
    const y = (i - x) / width;
    let bare = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height || out[ny * width + nx] === EMPTY) bare++;
      }
    }
    if (bare === 8) stranded.push(i);
  }
  for (const i of stranded) out[i] = EMPTY;
  return out;
}

