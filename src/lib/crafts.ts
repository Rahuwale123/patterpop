import { CM_PER_INCH, fabricToBuyCm, fabricToBuyInches, type FabricCount } from "@/lib/pattern/fabric";
import type { PaletteId } from "@/lib/pattern/palettes";
import type { StitchStyle } from "@/lib/pattern/render";
import { skeinsNeeded } from "@/lib/pattern/skeins";

// Everything that differs between the photo-to-pattern tools. One PatternTool
// drives them all; this file says what a "stitch" is, how big it comes out,
// what you need to buy and how the PDF is worded.

export type CraftId = "cross-stitch" | "perler" | "diamond" | "crochet" | "knitting";

/** Stitches and rows per 10 cm, as on a yarn label */
export type Gauge = { sts: number; rows: number };

export type SizeContext = { fabric: FabricCount; gauge: Gauge };

export type Craft = {
  id: CraftId;
  palette: PaletteId;
  style: StitchStyle;
  /** Used in download file names */
  fileKind: string;
  /** What one cell is called */
  unit: { one: string; many: string };
  /** Column heading for the colour code, e.g. "DMC" */
  codeLabel: string;
  pdfTitle: string;
  width: { min: number; max: number; default: number };
  colours: { default: number; max: number };
  /** "fabric": pick a fabric count. "fixed": bead/drill size is fixed. "gauge": enter your yarn gauge. */
  sizing: "fabric" | "fixed" | "gauge";
  defaultGauge?: Gauge;
  /** Cells per inch across */
  perInch: (ctx: SizeContext) => number;
  /** Cell height / width */
  cellAspect: (ctx: SizeContext) => number;
  sizeRows: (width: number, height: number, ctx: SizeContext) => [string, string][];
  supply?: { label: string; forCount: (count: number, ctx: SizeContext) => number };
  keyNote: (ctx: SizeContext) => string;
};

const f1 = (n: number) => n.toFixed(1);
const sizeLine = (wIn: number, hIn: number) =>
  `${f1(wIn)} × ${f1(hIn)} in (${f1(wIn * CM_PER_INCH)} × ${f1(hIn * CM_PER_INCH)} cm)`;

/** Fuse beads and drills are bought loose; 10% spare covers spills and lost ones. */
const withSpare = (n: number) => Math.ceil(n * 1.1);

// Fixed sizes: Perler standard beads sit on a 5 mm grid; square diamond-painting drills are 2.5 mm.
const PERLER_MM = 5;
const DRILL_MM = 2.5;
const PEGBOARD = 29; // large square Perler pegboard, 29 × 29 pegs
const CANVAS_BORDER_CM = 5;

export const CRAFTS: Record<CraftId, Craft> = {
  "cross-stitch": {
    id: "cross-stitch",
    fileKind: "cross-stitch",
    palette: "dmc",
    style: "cross",
    unit: { one: "stitch", many: "stitches" },
    codeLabel: "DMC",
    pdfTitle: "Cross stitch pattern",
    width: { min: 30, max: 150, default: 80 },
    colours: { default: 20, max: 40 },
    sizing: "fabric",
    perInch: (c) => c.fabric,
    cellAspect: () => 1,
    sizeRows: (w, h, c) => [
      ["Design", `${w} × ${h} stitches`],
      ["Fabric", `${c.fabric}-count Aida`],
      ["Finished", sizeLine(w / c.fabric, h / c.fabric)],
      [
        "Buy fabric",
        `${f1(fabricToBuyInches(w, c.fabric))} × ${f1(fabricToBuyInches(h, c.fabric))} in (${f1(fabricToBuyCm(w, c.fabric))} × ${f1(
          fabricToBuyCm(h, c.fabric),
        )} cm), with 3 in / 7.5 cm spare each side`,
      ],
    ],
    supply: { label: "Skeins", forCount: (n, c) => skeinsNeeded(n, c.fabric) },
    keyNote: (c) =>
      `DMC six-strand embroidery floss. Skeins assume 2 strands on ${c.fabric}-count with 10% spare. Colours on screen and paper are approximate.`,
  },
  perler: {
    id: "perler",
    fileKind: "perler-bead-pattern",
    palette: "perler",
    style: "bead",
    unit: { one: "bead", many: "beads" },
    codeLabel: "Perler",
    pdfTitle: "Perler bead pattern",
    width: { min: 10, max: 100, default: 40 },
    colours: { default: 15, max: 40 },
    sizing: "fixed",
    perInch: () => 25.4 / PERLER_MM,
    cellAspect: () => 1,
    sizeRows: (w, h) => [
      ["Design", `${w} × ${h} beads`],
      ["Finished", sizeLine((w * PERLER_MM) / 25.4, (h * PERLER_MM) / 25.4)],
      ["Pegboards", `${Math.ceil(w / PEGBOARD) * Math.ceil(h / PEGBOARD)} large square boards (${PEGBOARD} × ${PEGBOARD}), ${Math.ceil(w / PEGBOARD)} across × ${Math.ceil(h / PEGBOARD)} down`],
    ],
    supply: { label: "To buy", forCount: (n) => withSpare(n) },
    keyNote: () => "Perler standard (5 mm) fuse beads. Bead counts include 10% spare. Colours on screen are approximate.",
  },
  diamond: {
    id: "diamond",
    fileKind: "diamond-painting-pattern",
    palette: "dmc",
    style: "drill",
    unit: { one: "drill", many: "drills" },
    codeLabel: "DMC",
    pdfTitle: "Diamond painting pattern",
    width: { min: 30, max: 150, default: 100 },
    colours: { default: 25, max: 40 },
    sizing: "fixed",
    perInch: () => 25.4 / DRILL_MM,
    cellAspect: () => 1,
    sizeRows: (w, h) => [
      ["Design", `${w} × ${h} drills`],
      ["Picture", sizeLine((w * DRILL_MM) / 25.4, (h * DRILL_MM) / 25.4)],
      [
        "Canvas",
        `${f1((w * DRILL_MM) / 10 + CANVAS_BORDER_CM * 2)} × ${f1((h * DRILL_MM) / 10 + CANVAS_BORDER_CM * 2)} cm, with a ${CANVAS_BORDER_CM} cm border`,
      ],
    ],
    supply: { label: "To buy", forCount: (n) => withSpare(n) },
    keyNote: () => "Square 2.5 mm drills, numbered with DMC codes as most kits are. Counts include 10% spare.",
  },
  crochet: {
    id: "crochet",
    fileKind: "crochet-graph",
    palette: "free",
    style: "block",
    unit: { one: "square", many: "squares" },
    codeLabel: "No.",
    pdfTitle: "Crochet graph",
    width: { min: 20, max: 150, default: 60 },
    colours: { default: 8, max: 30 },
    sizing: "gauge",
    defaultGauge: { sts: 16, rows: 16 },
    perInch: (c) => (c.gauge.sts / 10) * CM_PER_INCH,
    cellAspect: (c) => c.gauge.sts / c.gauge.rows,
    sizeRows: (w, h, c) => [
      ["Graph", `${w} × ${h} squares`],
      ["Gauge", `${c.gauge.sts} squares × ${c.gauge.rows} rows per 10 cm`],
      ["Finished", sizeLine((w / c.gauge.sts) * 10 / CM_PER_INCH, (h / c.gauge.rows) * 10 / CM_PER_INCH)],
    ],
    keyNote: () => "Colours come from your photo, not a yarn brand. Pick the closest yarn you can buy.",
  },
  knitting: {
    id: "knitting",
    fileKind: "knitting-chart",
    palette: "free",
    style: "knit",
    unit: { one: "stitch", many: "stitches" },
    codeLabel: "No.",
    pdfTitle: "Knitting chart",
    width: { min: 20, max: 150, default: 60 },
    colours: { default: 6, max: 20 },
    sizing: "gauge",
    defaultGauge: { sts: 22, rows: 30 },
    perInch: (c) => (c.gauge.sts / 10) * CM_PER_INCH,
    cellAspect: (c) => c.gauge.sts / c.gauge.rows,
    sizeRows: (w, h, c) => [
      ["Chart", `${w} stitches × ${h} rows`],
      ["Gauge", `${c.gauge.sts} stitches × ${c.gauge.rows} rows per 10 cm`],
      ["Finished", sizeLine((w / c.gauge.sts) * 10 / CM_PER_INCH, (h / c.gauge.rows) * 10 / CM_PER_INCH)],
    ],
    keyNote: () =>
      "Colours come from your photo, not a yarn brand. Chart cells are drawn to your gauge, so the picture keeps its shape when knitted.",
  },
};
