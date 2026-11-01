"use client";

import { useEffect, useState } from "react";
import { EMPTY } from "@/lib/color/cleanup";
import { CRAFTS } from "@/lib/crafts";
import { FABRIC_COUNTS, type FabricCount } from "@/lib/pattern/fabric";
import { brandPalette } from "@/lib/pattern/palettes";
import type { Pattern } from "@/lib/pattern/pipeline";
import type { Paper } from "@/lib/pdf/buildPdf";
import { Preview } from "@/components/tool/Preview";
import { SizePanel } from "@/components/tool/SizePanel";
import { defaultPaper, ExportPanel } from "@/components/tool/ExportPanel";

// Popular DMC colours for lettering. Any other DMC number can be typed in.
const QUICK_COLOURS = ["310", "321", "666", "816", "349", "3607", "550", "797", "820", "3846", "699", "909", "3346", "973", "740", "433", "3865", "Blanc"];

const FONTS = {
  serif: { label: "Serif", cssVar: "--font-fraunces", weights: { regular: 500, bold: 700 } },
  sans: { label: "Sans", cssVar: "--font-figtree", weights: { regular: 400, bold: 600 } },
} as const;
type FontKey = keyof typeof FONTS;

// Text is drawn at this many pixels per stitch, then each stitch is filled if enough of it is covered.
const SUPERSAMPLE = 8;
const COVERAGE = 0.45;
const CAP_HEIGHT = 0.7; // cap height as a share of font size, roughly
const MAX_LINES = 4;

function renderText(text: string, font: FontKey, bold: boolean, capStitches: number): { cells: Int16Array; width: number; height: number } {
  const f = FONTS[font];
  const family = getComputedStyle(document.documentElement).getPropertyValue(f.cssVar).trim() || "serif";
  const weight = bold ? f.weights.bold : f.weights.regular;
  const px = (capStitches / CAP_HEIGHT) * SUPERSAMPLE;
  const lines = text.split("\n").slice(0, MAX_LINES).map((l) => l.trimEnd());
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) throw new Error("Canvas 2D is not available");
  const fontStr = `${weight} ${px}px ${family}`;
  probe.font = fontStr;
  const lineH = px * 1.2;
  const pad = SUPERSAMPLE * 2;
  const W = Math.ceil(Math.max(1, ...lines.map((l) => probe.measureText(l).width))) + pad * 2;
  const H = Math.ceil(lineH * lines.length) + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  ctx.font = fontStr;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000";
  lines.forEach((l, i) => ctx.fillText(l, W / 2, pad + i * lineH + px * 0.92));
  const alpha = ctx.getImageData(0, 0, W, H).data;

  const gw = Math.ceil(W / SUPERSAMPLE);
  const gh = Math.ceil(H / SUPERSAMPLE);
  const full = new Int16Array(gw * gh).fill(EMPTY);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      let sum = 0;
      let n = 0;
      for (let y = gy * SUPERSAMPLE; y < Math.min(H, (gy + 1) * SUPERSAMPLE); y++) {
        for (let x = gx * SUPERSAMPLE; x < Math.min(W, (gx + 1) * SUPERSAMPLE); x++) {
          sum += alpha[(y * W + x) * 4 + 3];
          n++;
        }
      }
      if (sum / n / 255 >= COVERAGE) full[gy * gw + gx] = 0;
    }
  }
  // Trim to the stitched area plus a one-stitch border
  let x0 = gw, y0 = gh, x1 = -1, y1 = -1;
  full.forEach((v, i) => {
    if (v === EMPTY) return;
    const x = i % gw;
    const y = (i - x) / gw;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  });
  if (x1 < 0) return { cells: new Int16Array(1).fill(EMPTY), width: 1, height: 1 };
  x0 = Math.max(0, x0 - 1);
  y0 = Math.max(0, y0 - 1);
  x1 = Math.min(gw - 1, x1 + 1);
  y1 = Math.min(gh - 1, y1 + 1);
  const width = x1 - x0 + 1;
  const height = y1 - y0 + 1;
  const cells = new Int16Array(width * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) cells[y * width + x] = full[(y + y0) * gw + (x + x0)];
  return { cells, width, height };
}

export function TextTool() {
  const [text, setText] = useState("Home sweet home");
  const [font, setFont] = useState<FontKey>("serif");
  const [bold, setBold] = useState(true);
  const [capHeight, setCapHeight] = useState(12);
  const [colourCode, setColourCode] = useState("321");
  const [fabric, setFabric] = useState<FabricCount>(14);
  const [paper, setPaper] = useState<Paper>(defaultPaper);
  const [pattern, setPattern] = useState<Pattern | null>(null);

  const dmc = brandPalette("dmc").colours;
  const colour = dmc.find((c) => c.code.toLowerCase() === colourCode.trim().toLowerCase());

  // Wait for the web font before drawing, or the first render uses a fallback font.
  useEffect(() => {
    let cancelled = false;
    const f = FONTS[font];
    const family = getComputedStyle(document.documentElement).getPropertyValue(f.cssVar).trim() || "serif";
    const t = setTimeout(() => {
      document.fonts
        .load(`${bold ? f.weights.bold : f.weights.regular} 48px ${family}`)
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return;
          const thread = brandPalette("dmc").colours.find((c) => c.code.toLowerCase() === colourCode.trim().toLowerCase());
          if (!thread) {
            setPattern(null);
            return;
          }
          const grid = renderText(text || " ", font, bold, capHeight);
          const count = grid.cells.reduce((sum, c) => sum + (c === EMPTY ? 0 : 1), 0);
          setPattern({
            ...grid,
            palette: [{ code: thread.code, name: thread.name, hex: thread.hex, symbol: "X", count }],
          });
        });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [text, font, bold, capHeight, colourCode]);

  const C = CRAFTS["cross-stitch"];
  const ctx = { fabric, gauge: { sts: 20, rows: 20 } };
  const stitches = pattern?.palette[0].count ?? 0;
  const skeins = C.supply!.forCount(stitches, ctx);

  return (
    <div className="grid gap-5 md:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-4 rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-4">
        <label htmlFor="tt-text" className="block text-sm font-semibold">
          Your text (up to {MAX_LINES} lines)
          <textarea
            id="tt-text"
            rows={3}
            value={text}
            maxLength={120}
            onChange={(e) => setText(e.currentTarget.value.split("\n").slice(0, MAX_LINES).join("\n"))}
            className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 font-normal"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label htmlFor="tt-font" className="text-sm font-semibold">
            Font
            <select
              id="tt-font"
              value={font}
              onChange={(e) => setFont(e.currentTarget.value as FontKey)}
              className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 font-normal"
            >
              {(Object.keys(FONTS) as FontKey[]).map((k) => (
                <option key={k} value={k}>
                  {FONTS[k].label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="tt-bold" className="flex items-end gap-2 pb-2 text-sm font-semibold">
            <input id="tt-bold" type="checkbox" checked={bold} onChange={(e) => setBold(e.currentTarget.checked)} className="h-4 w-4 accent-madder" />
            Bold
          </label>
        </div>
        <label htmlFor="tt-height" className="block text-sm font-semibold">
          <span className="flex justify-between">
            <span>Letter height</span>
            <output htmlFor="tt-height">{capHeight} stitches</output>
          </span>
          <input
            id="tt-height"
            type="range"
            min={7}
            max={40}
            value={capHeight}
            onChange={(e) => setCapHeight(Number(e.currentTarget.value))}
            className="mt-1 w-full accent-madder"
          />
          <span className="text-xs font-normal text-muted">Capital letters; 10 or more keeps curves smooth.</span>
        </label>
        <fieldset>
          <legend className="text-sm font-semibold">Thread colour</legend>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {QUICK_COLOURS.map((code) => {
              const c = dmc.find((d) => d.code === code);
              if (!c) return null;
              return (
                <button
                  key={code}
                  type="button"
                  title={`DMC ${c.code} ${c.name}`}
                  aria-label={`DMC ${c.code} ${c.name}`}
                  aria-pressed={colour?.code === c.code}
                  onClick={() => setColourCode(c.code)}
                  className={`h-7 w-7 rounded-full border-2 ${colour?.code === c.code ? "border-charcoal ring-2 ring-madder" : "border-black/20"}`}
                  style={{ background: c.hex }}
                />
              );
            })}
          </div>
          <label htmlFor="tt-code" className="mt-2 block text-xs font-semibold">
            Or any DMC number
            <input
              id="tt-code"
              value={colourCode}
              onChange={(e) => setColourCode(e.currentTarget.value)}
              className="mt-0.5 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1 text-sm font-normal"
            />
          </label>
          <p className="mt-1 text-xs text-muted">
            {colour ? `DMC ${colour.code} ${colour.name}` : "That isn't a DMC number we know."}
          </p>
        </fieldset>
        <label htmlFor="tt-fabric" className="block text-sm font-semibold">
          Fabric count (stitches per inch)
          <select
            id="tt-fabric"
            value={fabric}
            onChange={(e) => setFabric(Number(e.currentTarget.value) as FabricCount)}
            className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 font-normal"
          >
            {FABRIC_COUNTS.map((c) => (
              <option key={c} value={c}>
                {c}-count Aida
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="min-w-0 space-y-5">
        {pattern ? (
          <>
            <Preview pattern={pattern} label="Your lettering" height={320} />
            <div className="rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-4">
              <SizePanel
                rows={[
                  ...C.sizeRows(pattern.width, pattern.height, ctx),
                  [
                    "Thread",
                    `DMC ${pattern.palette[0].code} ${pattern.palette[0].name}: ${stitches.toLocaleString()} stitches, ${skeins} ${skeins === 1 ? "skein" : "skeins"}`,
                  ],
                ]}
              />
            </div>
            <div className="rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-4">
              <ExportPanel
                pattern={pattern}
                paper={paper}
                onPaperChange={setPaper}
                fileKind="cross-stitch-lettering"
                pdf={{
                  title: "Cross stitch lettering",
                  details: [...C.sizeRows(pattern.width, pattern.height, ctx), ["Stitches", stitches.toLocaleString("en-US")]],
                  keyNote: C.keyNote(ctx),
                  codeLabel: "DMC",
                  countLabel: "Stitches",
                  supply: { label: "Skeins", forCount: (n) => C.supply!.forCount(n, ctx) },
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex h-[320px] items-center justify-center rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen font-semibold">
            {colour ? "Drawing your lettering…" : "Pick a thread colour."}
          </div>
        )}
      </div>
    </div>
  );
}
