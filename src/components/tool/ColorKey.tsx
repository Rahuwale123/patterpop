"use client";

import type { PaletteEntry } from "@/lib/pattern/pipeline";

export function ColorKey({ palette }: { palette: PaletteEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <caption className="sr-only">Colour key</caption>
        <thead>
          <tr className="border-b-2 border-charcoal/30">
            <th scope="col" className="py-2 pr-2">Symbol</th>
            <th scope="col" className="py-2 pr-2">Colour</th>
            <th scope="col" className="py-2 pr-2">DMC</th>
            <th scope="col" className="py-2 pr-2">Name</th>
            <th scope="col" className="py-2 text-right">Stitches</th>
          </tr>
        </thead>
        <tbody>
          {palette.map((c) => (
            <tr key={c.code} className="border-b border-dashed border-charcoal/20">
              <td className="py-1.5 pr-2 font-[Helvetica,Arial,sans-serif] text-base font-bold">{c.symbol}</td>
              <td className="py-1.5 pr-2">
                <span
                  className="inline-block h-5 w-8 rounded-sm border border-black/20 align-middle"
                  style={{ background: c.hex }}
                />
              </td>
              <td className="py-1.5 pr-2 font-semibold">{c.code}</td>
              <td className="py-1.5 pr-2">{c.name}</td>
              <td className="py-1.5 text-right tabular-nums">{c.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
