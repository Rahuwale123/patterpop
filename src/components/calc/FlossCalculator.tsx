"use client";

import { useState } from "react";
import { skeinsNeeded, stitchesPerSkein } from "@/lib/pattern/skeins";
import { DEFAULT_FABRIC, FABRICS } from "./fabrics";

type Row = { id: number; name: string; stitches: number };

export function FlossCalculator() {
  const [fabric, setFabric] = useState(DEFAULT_FABRIC);
  const [strands, setStrands] = useState(2);
  const [rows, setRows] = useState<Row[]>([
    { id: 1, name: "DMC 310", stitches: 2500 },
    { id: 2, name: "DMC 321", stitches: 900 },
  ]);
  const [nextId, setNextId] = useState(3);
  const per = FABRICS[fabric].perInch;
  const perSkein = stitchesPerSkein(per, strands);
  const total = rows.reduce((s, r) => s + skeinsNeeded(Math.max(0, r.stitches || 0), per, strands), 0);

  const update = (id: number, patch: Partial<Row>) => setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="mx-auto max-w-[900px] rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor="flc-fabric" className="block text-sm font-semibold">
          Fabric
          <select
            id="flc-fabric"
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
        <label htmlFor="flc-strands" className="block text-sm font-semibold">
          Strands
          <select
            id="flc-strands"
            value={strands}
            onChange={(e) => setStrands(Number(e.currentTarget.value))}
            className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 font-normal"
          >
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n} strand{n > 1 ? "s" : ""}
                {n === 2 ? " (usual for 14-count)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-muted">
        One skein covers about <strong>{perSkein.toLocaleString()}</strong> full cross stitches on this fabric with {strands} strand
        {strands > 1 ? "s" : ""}. Results include 10% spare.
      </p>
      <div className="relative mt-4 overflow-x-auto">
        <table className="w-full min-w-[440px] border-collapse text-left text-sm">
          <caption className="sr-only">Skeins needed per colour</caption>
          <thead>
            <tr className="border-b-2 border-charcoal/30">
              <th scope="col" className="py-2 pr-2">Colour</th>
              <th scope="col" className="py-2 pr-2">Stitches</th>
              <th scope="col" className="py-2 pr-2 text-right">Skeins</th>
              <th scope="col" className="py-2"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b border-dashed border-charcoal/20">
                <td className="py-1.5 pr-2">
                  <input
                    aria-label={`Colour ${i + 1} name`}
                    value={r.name}
                    onChange={(e) => update(r.id, { name: e.currentTarget.value })}
                    className="w-full rounded border border-charcoal/30 bg-linen px-2 py-1"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    aria-label={`Colour ${i + 1} stitches`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={Number.isFinite(r.stitches) ? r.stitches : ""}
                    onChange={(e) => update(r.id, { stitches: Number(e.currentTarget.value) })}
                    className="w-28 rounded border border-charcoal/30 bg-linen px-2 py-1"
                  />
                </td>
                <td className="py-1.5 pr-2 text-right text-base font-semibold tabular-nums">
                  {skeinsNeeded(Math.max(0, r.stitches || 0), per, strands)}
                </td>
                <td className="py-1.5 text-right">
                  <button
                    onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
                    disabled={rows.length === 1}
                    aria-label={`Remove colour ${i + 1}`}
                    className="rounded px-2 py-0.5 text-sm hover:bg-aida-deep disabled:opacity-30"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="pt-2" colSpan={2}>
                Total
              </td>
              <td className="pt-2 pr-2 text-right text-lg text-madder tabular-nums">{total}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <button
        onClick={() => {
          setRows([...rows, { id: nextId, name: `Colour ${rows.length + 1}`, stitches: 500 }]);
          setNextId(nextId + 1);
        }}
        className="mt-3 rounded-lg border-2 border-dashed border-madder px-3 py-1.5 text-sm font-semibold text-madder hover:bg-aida-deep"
      >
        Add a colour
      </button>
    </div>
  );
}
