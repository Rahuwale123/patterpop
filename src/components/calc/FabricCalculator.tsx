"use client";

import { useState } from "react";
import { CM_PER_INCH } from "@/lib/pattern/fabric";
import { DEFAULT_FABRIC, FABRICS } from "./fabrics";

const f1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "–");
// A fat quarter of Aida is usually about 18 × 21 inches.
const FAT_QUARTER: [number, number] = [18, 21];

function NumberField(props: { id: string; label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label htmlFor={props.id} className="block text-sm font-semibold">
      {props.label}
      <input
        id={props.id}
        type="number"
        inputMode="numeric"
        min={props.min ?? 1}
        max={props.max ?? 2000}
        value={Number.isFinite(props.value) ? props.value : ""}
        onChange={(e) => props.onChange(Number(e.currentTarget.value))}
        className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 font-normal"
      />
    </label>
  );
}

export function FabricCalculator() {
  const [w, setW] = useState(120);
  const [h, setH] = useState(90);
  const [fabric, setFabric] = useState(DEFAULT_FABRIC);
  const [margin, setMargin] = useState(3);
  const per = FABRICS[fabric].perInch;
  const wIn = w / per;
  const hIn = h / per;
  const buyW = wIn + margin * 2;
  const buyH = hIn + margin * 2;
  const fitsFq = (buyW <= FAT_QUARTER[0] && buyH <= FAT_QUARTER[1]) || (buyW <= FAT_QUARTER[1] && buyH <= FAT_QUARTER[0]);

  return (
    <div className="mx-auto grid max-w-[900px] gap-5 rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-5 md:grid-cols-2">
      <fieldset className="space-y-3">
        <legend className="font-serif text-lg font-bold">Your design</legend>
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="fc-w" label="Width (stitches)" value={w} onChange={setW} />
          <NumberField id="fc-h" label="Height (stitches)" value={h} onChange={setH} />
        </div>
        <label htmlFor="fc-fabric" className="block text-sm font-semibold">
          Fabric
          <select
            id="fc-fabric"
            value={fabric}
            onChange={(e) => setFabric(Number(e.currentTarget.value))}
            className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 font-normal"
          >
            {FABRICS.map((f, i) => (
              <option key={f.label} value={i}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="fc-margin" className="block text-sm font-semibold">
          Spare fabric on each side
          <select
            id="fc-margin"
            value={margin}
            onChange={(e) => setMargin(Number(e.currentTarget.value))}
            className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 font-normal"
          >
            <option value={2}>2 in (5 cm): small hoop, no framing</option>
            <option value={3}>3 in (7.5 cm): the usual choice</option>
            <option value={4}>4 in (10 cm): large frames or scroll frames</option>
          </select>
        </label>
      </fieldset>
      <div aria-live="polite" className="space-y-3">
        <h2 className="font-serif text-lg font-bold">Result</h2>
        <div className="rounded-lg bg-aida p-3">
          <p className="text-sm text-muted">Finished design</p>
          <p className="text-xl font-semibold">
            {f1(wIn)} × {f1(hIn)} in
          </p>
          <p>
            {f1(wIn * CM_PER_INCH)} × {f1(hIn * CM_PER_INCH)} cm
          </p>
        </div>
        <div className="rounded-lg border-2 border-madder bg-linen p-3">
          <p className="text-sm text-muted">Fabric to buy</p>
          <p className="text-2xl font-semibold text-madder">
            {f1(buyW)} × {f1(buyH)} in
          </p>
          <p>
            {f1(buyW * CM_PER_INCH)} × {f1(buyH * CM_PER_INCH)} cm
          </p>
        </div>
        <p className="text-sm">
          {fitsFq ? "Fits on a fat quarter (about 18 × 21 in)." : "Too big for a fat quarter (about 18 × 21 in); buy from the bolt or a larger piece."}
        </p>
      </div>
    </div>
  );
}
