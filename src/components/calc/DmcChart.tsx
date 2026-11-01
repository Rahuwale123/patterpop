"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";

export type ChartColour = { code: string; name: string; hex: string; family: string };

export const FAMILIES = ["All", "Reds", "Pinks", "Oranges", "Yellows", "Greens", "Blues", "Purples", "Browns", "Greys", "Whites", "Blacks"];

export function DmcChart({ colours }: { colours: ChartColour[] }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("All");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return colours.filter(
      (c) =>
        (family === "All" || c.family === family) &&
        (!q || c.code.toLowerCase().startsWith(q) || c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)),
    );
  }, [colours, query, family]);

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label htmlFor="dmc-search" className="block flex-1 text-sm font-semibold">
          Search by number, name or hex
          <input
            id="dmc-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="e.g. 310, coral, #C12041"
            className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-3 py-2 font-normal"
            autoComplete="off"
          />
        </label>
        <p className="text-sm text-muted" aria-live="polite">
          {shown.length} of {colours.length} colours
        </p>
      </div>
      <div role="group" aria-label="Colour family" className="mt-3 flex flex-wrap gap-1.5">
        {FAMILIES.map((f) => (
          <button
            key={f}
            aria-pressed={family === f}
            onClick={() => setFamily(f)}
            className={clsx(
              "rounded-full border border-dashed px-3 py-1 text-sm font-semibold",
              family === f ? "border-madder bg-madder text-linen" : "border-hoop-dark/60 bg-linen hover:bg-aida-deep",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="relative mt-4 max-h-[640px] overflow-auto rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">DMC embroidery floss colours</caption>
          <thead className="sticky top-0 bg-linen">
            <tr className="border-b-2 border-charcoal/30">
              <th scope="col" className="px-3 py-2">Colour</th>
              <th scope="col" className="px-3 py-2">DMC</th>
              <th scope="col" className="px-3 py-2">Name</th>
              <th scope="col" className="px-3 py-2">Hex</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.code} className="border-b border-dashed border-charcoal/15">
                <td className="px-3 py-1.5">
                  <span className="inline-block h-6 w-12 rounded-sm border border-black/20 align-middle" style={{ background: c.hex }} />
                </td>
                <td className="px-3 py-1.5 font-semibold">{c.code}</td>
                <td className="px-3 py-1.5">{c.name}</td>
                <td className="px-3 py-1.5 font-mono text-xs text-muted">{c.hex}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-4 text-muted">No DMC colour matches that.</p>}
      </div>
    </div>
  );
}
