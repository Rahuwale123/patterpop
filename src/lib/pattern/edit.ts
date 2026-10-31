import { EMPTY } from "@/lib/color/cleanup";
import { DMC } from "./dmc";
import type { Pattern } from "./pipeline";

/**
 * Colour key edits are stored as operations by DMC code, so they can be
 * re-applied after the pattern is regenerated with new settings.
 */
export type ColourEdit = { type: "merge"; from: string; into: string } | { type: "swap"; from: string; to: string };

const byCode = new Map(DMC.map((f) => [f.code, f]));

export function findFloss(code: string) {
  return byCode.get(code);
}

function mergeInto(p: Pattern, fromIdx: number, intoIdx: number): Pattern {
  const palette = p.palette.map((c) => ({ ...c }));
  palette[intoIdx].count += palette[fromIdx].count;
  palette.splice(fromIdx, 1);
  const target = intoIdx > fromIdx ? intoIdx - 1 : intoIdx;
  const cells = p.cells.map((c) => {
    if (c === EMPTY) return EMPTY;
    if (c === fromIdx) return target;
    return c > fromIdx ? c - 1 : c;
  });
  return { ...p, cells, palette };
}

export function applyEdit(p: Pattern, e: ColourEdit): Pattern {
  const fromIdx = p.palette.findIndex((c) => c.code === e.from);
  if (fromIdx < 0) return p; // colour no longer in the pattern
  if (e.type === "merge") {
    const intoIdx = p.palette.findIndex((c) => c.code === e.into);
    return intoIdx < 0 || intoIdx === fromIdx ? p : mergeInto(p, fromIdx, intoIdx);
  }
  const existing = p.palette.findIndex((c) => c.code === e.to);
  if (existing >= 0) return existing === fromIdx ? p : mergeInto(p, fromIdx, existing);
  const floss = findFloss(e.to);
  if (!floss) return p;
  const palette = p.palette.map((c, i) => (i === fromIdx ? { ...c, code: floss.code, name: floss.name, hex: floss.hex } : c));
  return { ...p, palette };
}

export function applyEdits(p: Pattern, edits: ColourEdit[]): Pattern {
  return edits.reduce(applyEdit, p);
}
