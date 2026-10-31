import type { jsPDF as JsPDF } from "jspdf";
import { EMPTY } from "@/lib/color/cleanup";
import { hexToRgb } from "@/lib/color/lab";
import { fabricToBuyCm, fabricToBuyInches, finishedSizeInches, inchesToCm, type FabricCount } from "@/lib/pattern/fabric";
import { skeinsNeeded } from "@/lib/pattern/skeins";
import { drawRealistic } from "@/lib/pattern/render";
import type { Pattern } from "@/lib/pattern/pipeline";

export type Paper = "a4" | "letter";

export type PdfOptions = {
  paper: Paper;
  fabric: FabricCount;
};

// Chart sections: about 50 x 70 stitches a page, with a few stitches of the
// neighbouring page repeated (shaded) on the right and bottom so you can line up.
const MAX_COLS = 50;
const MAX_ROWS = 70;
const OVERLAP = 3;

const MARGIN = 12;
const FOOTER = "Made with PatternPop – patternpop.online";
// TODO(pro): when the Pro licence check lands, skip the footer watermark for Pro users.

type Section = { index: number; x0: number; y0: number; cols: number; rows: number };

function splitEven(total: number, max: number): [number, number][] {
  const parts = Math.ceil(total / max);
  const size = Math.ceil(total / parts);
  const out: [number, number][] = [];
  for (let start = 0; start < total; start += size) out.push([start, Math.min(size, total - start)]);
  return out;
}

export function chartSections(p: Pattern): { sections: Section[]; across: number; down: number } {
  const xs = splitEven(p.width, MAX_COLS);
  const ys = splitEven(p.height, MAX_ROWS);
  const sections: Section[] = [];
  for (const [y0, rows] of ys) for (const [x0, cols] of xs) sections.push({ index: sections.length, x0, y0, cols, rows });
  return { sections, across: xs.length, down: ys.length };
}

function previewJpeg(p: Pattern): string {
  const cell = Math.max(2, Math.floor(900 / Math.max(p.width, p.height)));
  const canvas = document.createElement("canvas");
  canvas.width = p.width * cell;
  canvas.height = p.height * cell;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  drawRealistic(ctx, p, cell);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function fmt(n: number): string {
  return n.toFixed(1);
}

export async function buildPdf(p: Pattern, opts: PdfOptions): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc: JsPDF = new jsPDF({ unit: "mm", format: opts.paper, orientation: "portrait", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const { sections, across, down } = chartSections(p);
  const firstChartPage = 2;

  drawCover(doc, p, opts, pageW, sections, across, down, firstChartPage);
  for (const s of sections) {
    doc.addPage();
    drawChartPage(doc, p, s, sections.length, across, pageW, pageH, firstChartPage);
  }
  drawKey(doc, p, opts, pageW, pageH);

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(FOOTER, MARGIN, pageH - 7);
    doc.text(`Page ${i} of ${total}`, pageW - MARGIN, pageH - 7, { align: "right" });
  }
  return doc.output("blob");
}

function drawCover(
  doc: JsPDF,
  p: Pattern,
  opts: PdfOptions,
  pageW: number,
  sections: Section[],
  across: number,
  down: number,
  firstChartPage: number,
) {
  let y = MARGIN + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30);
  doc.text("Cross stitch pattern", MARGIN, y);
  y += 8;

  // Preview
  const maxW = pageW - MARGIN * 2;
  const maxH = 115;
  const scale = Math.min(maxW / p.width, maxH / p.height);
  const w = p.width * scale;
  const h = p.height * scale;
  doc.addImage(previewJpeg(p), "JPEG", (pageW - w) / 2, y, w, h);
  y += h + 10;

  const wIn = finishedSizeInches(p.width, opts.fabric);
  const hIn = finishedSizeInches(p.height, opts.fabric);
  const stitches = p.palette.reduce((s, c) => s + c.count, 0);
  const skeins = p.palette.reduce((s, c) => s + skeinsNeeded(c.count, opts.fabric), 0);
  const rows: [string, string][] = [
    ["Design size", `${p.width} x ${p.height} stitches`],
    ["Fabric", `${opts.fabric}-count Aida`],
    ["Finished size", `${fmt(wIn)} x ${fmt(hIn)} in  (${fmt(inchesToCm(wIn))} x ${fmt(inchesToCm(hIn))} cm)`],
    [
      "Fabric to buy",
      `${fmt(fabricToBuyInches(p.width, opts.fabric))} x ${fmt(fabricToBuyInches(p.height, opts.fabric))} in  (${fmt(
        fabricToBuyCm(p.width, opts.fabric),
      )} x ${fmt(fabricToBuyCm(p.height, opts.fabric))} cm), 3 in / 7.5 cm spare each side`,
    ],
    ["Colours", `${p.palette.length} DMC colours, ${skeins} skeins in total`],
    ["Stitches", `${stitches.toLocaleString("en-US")} full cross stitches, 2 strands`],
  ];
  doc.setFontSize(10);
  for (const [k, v] of rows) {
    doc.setFont("helvetica", "bold");
    doc.text(k, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(v, MARGIN + 32, y, { maxWidth: pageW - MARGIN * 2 - 32 });
    y += 6.5;
  }

  // Page map: which chart page covers which part of the design
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Chart pages", MARGIN, y);
  y += 4;
  const mapScale = Math.min(70 / p.width, 50 / p.height);
  for (const s of sections) {
    const sx = MARGIN + s.x0 * mapScale;
    const sy = y + s.y0 * mapScale;
    doc.setDrawColor(60);
    doc.setLineWidth(0.3);
    doc.rect(sx, sy, s.cols * mapScale, s.rows * mapScale, "S");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`p${firstChartPage + s.index}`, sx + (s.cols * mapScale) / 2, sy + (s.rows * mapScale) / 2, {
      align: "center",
      baseline: "middle",
    });
  }
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(
    `${across} across x ${down} down. Shaded stitches at a page edge repeat the start of the next page.`,
    MARGIN + 76,
    y + 4,
    { maxWidth: pageW - MARGIN * 2 - 76 },
  );
  doc.setTextColor(30);
}

function drawChartPage(
  doc: JsPDF,
  p: Pattern,
  s: Section,
  totalSections: number,
  across: number,
  pageW: number,
  pageH: number,
  firstChartPage: number,
) {
  const extraCols = Math.min(OVERLAP, p.width - (s.x0 + s.cols));
  const extraRows = Math.min(OVERLAP, p.height - (s.y0 + s.rows));
  const cols = s.cols + extraCols;
  const rows = s.rows + extraRows;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(`Chart ${s.index + 1} of ${totalSections}`, MARGIN, MARGIN + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Columns ${s.x0 + 1}–${s.x0 + s.cols}, rows ${s.y0 + 1}–${s.y0 + s.rows}`,
    pageW - MARGIN,
    MARGIN + 2,
    { align: "right" },
  );

  const gutter = 7;
  const top = MARGIN + 6 + gutter;
  const left = MARGIN + gutter;
  const availW = pageW - left - MARGIN;
  const availH = pageH - top - MARGIN - 6;
  const cell = Math.min(availW / cols, availH / rows);

  // Shade the overlap strip
  doc.setFillColor(232, 232, 232);
  if (extraCols > 0) doc.rect(left + s.cols * cell, top, extraCols * cell, rows * cell, "F");
  if (extraRows > 0) doc.rect(left, top + s.rows * cell, s.cols * cell, extraRows * cell, "F");

  // Symbols, black and white
  doc.setFont("helvetica", "bold");
  doc.setFontSize(cell * 2.835 * 0.72);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = p.cells[(s.y0 + r) * p.width + (s.x0 + c)];
      if (v === EMPTY) continue;
      const overlap = c >= s.cols || r >= s.rows;
      doc.setTextColor(overlap ? 120 : 0);
      doc.text(p.palette[v].symbol, left + (c + 0.5) * cell, top + (r + 0.5) * cell, {
        align: "center",
        baseline: "middle",
      });
    }
  }

  // Grid: thin every stitch, bold on every 10th stitch of the whole design
  for (let c = 0; c <= cols; c++) {
    const g = s.x0 + c;
    const bold = g % 10 === 0 || g === p.width;
    doc.setDrawColor(bold ? 0 : 170);
    doc.setLineWidth(bold ? 0.45 : 0.1);
    doc.line(left + c * cell, top, left + c * cell, top + rows * cell);
  }
  for (let r = 0; r <= rows; r++) {
    const g = s.y0 + r;
    const bold = g % 10 === 0 || g === p.height;
    doc.setDrawColor(bold ? 0 : 170);
    doc.setLineWidth(bold ? 0.45 : 0.1);
    doc.line(left, top + r * cell, left + cols * cell, top + r * cell);
  }

  // Edge numbers at every 10th stitch
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(40);
  for (let c = 0; c <= cols; c++) {
    const g = s.x0 + c;
    if (g % 10 === 0 && g > 0) doc.text(String(g), left + c * cell, top - 2, { align: "center" });
  }
  for (let r = 0; r <= rows; r++) {
    const g = s.y0 + r;
    if (g % 10 === 0 && g > 0) doc.text(String(g), left - 1.5, top + r * cell, { align: "right", baseline: "middle" });
  }

  // Centre marks: small arrows pointing at the middle of the design, if it's on this page
  const midX = p.width / 2;
  const midY = p.height / 2;
  doc.setFillColor(155, 44, 35);
  if (midX >= s.x0 && midX <= s.x0 + cols) {
    const x = left + (midX - s.x0) * cell;
    doc.triangle(x - 1.5, top - 6, x + 1.5, top - 6, x, top - 4, "F");
  }
  if (midY >= s.y0 && midY <= s.y0 + rows) {
    const y = top + (midY - s.y0) * cell;
    doc.triangle(left - 7, y - 1.5, left - 7, y + 1.5, left - 5, y, "F");
  }

  // Where the chart continues
  doc.setFontSize(8);
  doc.setTextColor(90);
  const neighbours: string[] = [];
  if (extraCols > 0) neighbours.push(`right: page ${firstChartPage + s.index + 1}`);
  if (extraRows > 0) neighbours.push(`below: page ${firstChartPage + s.index + across}`);
  if (neighbours.length) doc.text(`Continues ${neighbours.join(", ")}`, left, top + rows * cell + 5);
  doc.setTextColor(30);
}

function drawKey(doc: JsPDF, p: Pattern, opts: PdfOptions, pageW: number, pageH: number) {
  doc.addPage();
  let y = MARGIN + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text("Colour key and shopping list", MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(
    `DMC six-strand embroidery floss. Skeins assume 2 strands on ${opts.fabric}-count with 10% spare. Colours on screen and paper are approximate.`,
    MARGIN,
    y,
    { maxWidth: pageW - MARGIN * 2 },
  );
  y += 10;

  const colX = { sym: MARGIN, sw: MARGIN + 14, code: MARGIN + 30, name: MARGIN + 50, st: pageW - MARGIN - 22, sk: pageW - MARGIN };
  const header = (continued = false) => {
    if (continued) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(30);
      doc.text("Colour key and shopping list (continued)", MARGIN, y);
      y += 10;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text("Symbol", colX.sym, y);
    doc.text("Colour", colX.sw, y);
    doc.text("DMC", colX.code, y);
    doc.text("Name", colX.name, y);
    doc.text("Stitches", colX.st, y, { align: "right" });
    doc.text("Skeins", colX.sk, y, { align: "right" });
    y += 2;
    doc.setDrawColor(30);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, pageW - MARGIN, y);
    y += 5;
  };
  header();

  const rowH = 7;
  let totalSkeins = 0;
  for (const c of p.palette) {
    if (y > pageH - MARGIN - 18) {
      doc.addPage();
      y = MARGIN + 6;
      header(true);
    }
    const skeins = skeinsNeeded(c.count, opts.fabric);
    totalSkeins += skeins;
    doc.setDrawColor(30);
    doc.setLineWidth(0.2);
    doc.rect(colX.sym, y - 4, 5.5, 5.5, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(c.symbol, colX.sym + 2.75, y - 1.25, { align: "center", baseline: "middle" });
    const [r, g, b] = hexToRgb(c.hex);
    doc.setFillColor(r, g, b);
    doc.rect(colX.sw, y - 4, 11, 5.5, "FD");
    doc.setFontSize(10);
    doc.text(c.code, colX.code, y);
    doc.setFont("helvetica", "normal");
    doc.text(c.name, colX.name, y, { maxWidth: colX.st - colX.name - 20 });
    doc.text(c.count.toLocaleString("en-US"), colX.st, y, { align: "right" });
    doc.text(String(skeins), colX.sk, y, { align: "right" });
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.line(MARGIN, y + 2.5, pageW - MARGIN, y + 2.5);
    y += rowH;
  }
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.text(`${p.palette.length} colours`, colX.name, y);
  doc.text(`${totalSkeins} skeins`, colX.sk, y, { align: "right" });
}
