export const FABRIC_COUNTS = [11, 14, 16, 18] as const;
export type FabricCount = (typeof FABRIC_COUNTS)[number];

export const CM_PER_INCH = 2.54;
/** Spare fabric on every side, for the hoop and for framing. */
export const FABRIC_MARGIN_IN = 3;
export const FABRIC_MARGIN_CM = 7.5;

export function finishedSizeInches(stitches: number, count: FabricCount): number {
  return stitches / count;
}

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function fabricToBuyInches(stitches: number, count: FabricCount): number {
  return finishedSizeInches(stitches, count) + FABRIC_MARGIN_IN * 2;
}

export function fabricToBuyCm(stitches: number, count: FabricCount): number {
  return inchesToCm(finishedSizeInches(stitches, count)) + FABRIC_MARGIN_CM * 2;
}
