/** Fabrics stitchers use, as stitches per inch. Evenweave and linen are usually stitched over two threads. */
export const FABRICS: { label: string; perInch: number }[] = [
  { label: "11-count Aida", perInch: 11 },
  { label: "14-count Aida", perInch: 14 },
  { label: "16-count Aida", perInch: 16 },
  { label: "18-count Aida", perInch: 18 },
  { label: "20-count Aida", perInch: 20 },
  { label: "25-count evenweave, over 2", perInch: 12.5 },
  { label: "28-count evenweave, over 2", perInch: 14 },
  { label: "32-count linen, over 2", perInch: 16 },
  { label: "36-count linen, over 2", perInch: 18 },
];

export const DEFAULT_FABRIC = 1; // 14-count Aida
