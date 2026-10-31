"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { deltaE2000Lab } from "@/lib/color/ciede2000";
import { hexToLab } from "@/lib/color/lab";
import { DMC } from "@/lib/pattern/dmc";
import type { FabricCount } from "@/lib/pattern/fabric";
import type { PaletteEntry } from "@/lib/pattern/pipeline";
import { skeinsNeeded } from "@/lib/pattern/skeins";

type Props = {
  palette: PaletteEntry[];
  fabric: FabricCount;
  onMerge: (from: string, into: string) => void;
  onSwap: (from: string, to: string) => void;
  edited: boolean;
  onReset: () => void;
};

function Swatch({ hex }: { hex: string }) {
  return <span className="inline-block h-5 w-8 shrink-0 rounded-sm border border-black/20 align-middle" style={{ background: hex }} />;
}

function EditRow({
  entry,
  palette,
  onMerge,
  onSwap,
  onClose,
}: {
  entry: PaletteEntry;
  palette: PaletteEntry[];
  onMerge: (into: string) => void;
  onSwap: (to: string) => void;
  onClose: () => void;
}) {
  const id = useId();
  const others = palette.filter((c) => c.code !== entry.code);
  const [into, setInto] = useState(others[0]?.code ?? "");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Nothing typed: suggest the closest DMC shades to this colour.
      const lab = hexToLab(entry.hex);
      return [...DMC]
        .filter((f) => f.code !== entry.code)
        .map((f) => ({ f, d: deltaE2000Lab(lab, f.lab) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 8)
        .map((x) => x.f);
    }
    return DMC.filter((f) => f.code.toLowerCase().startsWith(q) || f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, entry]);

  return (
    <div className="grid gap-4 rounded-lg bg-aida p-3 sm:grid-cols-2">
      {others.length > 0 && (
        <div>
          <label htmlFor={`${id}-merge`} className="text-sm font-semibold">
            Merge DMC {entry.code} into
          </label>
          <div className="mt-1 flex gap-2">
            <select
              id={`${id}-merge`}
              value={into}
              onChange={(e) => setInto(e.currentTarget.value)}
              className="min-w-0 flex-1 rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 text-sm"
            >
              {others.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} DMC {c.code} {c.name}
                </option>
              ))}
            </select>
            <button onClick={() => onMerge(into)} className="rounded-md bg-madder px-3 py-1.5 text-sm font-semibold text-linen hover:bg-madder-dark">
              Merge
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">One less colour to buy. Its stitches take the other colour.</p>
        </div>
      )}
      <div>
        <label htmlFor={`${id}-swap`} className="text-sm font-semibold">
          Swap for another DMC colour
        </label>
        <input
          id={`${id}-swap`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Number or name, e.g. 310 or coral"
          className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5 text-sm"
          autoComplete="off"
        />
        <p className="mt-1 text-xs text-muted">{query ? "Matches" : "Closest shades"}</p>
        <ul className="mt-1 max-h-48 space-y-0.5 overflow-y-auto">
          {results.map((f) => (
            <li key={f.code}>
              <button
                onClick={() => onSwap(f.code)}
                className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-aida-deep"
              >
                <Swatch hex={f.hex} />
                <span className="font-semibold">{f.code}</span>
                <span className="truncate">{f.name}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="text-sm text-muted">No DMC colour matches that.</li>}
        </ul>
      </div>
      <div className="sm:col-span-2">
        <button onClick={onClose} className="text-sm font-semibold underline underline-offset-2">
          Done
        </button>
      </div>
    </div>
  );
}

export function ColorKey({ palette, fabric, onMerge, onSwap, edited, onReset }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const totalSkeins = palette.reduce((s, c) => s + skeinsNeeded(c.count, fabric), 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <caption className="sr-only">Colour key and shopping list</caption>
          <thead>
            <tr className="border-b-2 border-charcoal/30">
              <th scope="col" className="py-2 pr-2">Symbol</th>
              <th scope="col" className="py-2 pr-2">Colour</th>
              <th scope="col" className="py-2 pr-2">DMC</th>
              <th scope="col" className="py-2 pr-2">Name</th>
              <th scope="col" className="py-2 pr-2 text-right">Stitches</th>
              <th scope="col" className="py-2 pr-2 text-right">Skeins</th>
              <th scope="col" className="py-2"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody>
            {palette.map((c) => (
              <FragmentRow
                key={c.code}
                entry={c}
                fabric={fabric}
                open={editing === c.code}
                onToggle={() => setEditing(editing === c.code ? null : c.code)}
              >
                <EditRow
                  entry={c}
                  palette={palette}
                  onClose={() => setEditing(null)}
                  onMerge={(into) => {
                    setEditing(null);
                    onMerge(c.code, into);
                  }}
                  onSwap={(to) => {
                    setEditing(to);
                    onSwap(c.code, to);
                  }}
                />
              </FragmentRow>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={4} className="pt-2">{palette.length} colours</td>
              <td className="pt-2 pr-2 text-right tabular-nums">
                {palette.reduce((s, c) => s + c.count, 0).toLocaleString()}
              </td>
              <td className="pt-2 pr-2 text-right tabular-nums">{totalSkeins}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        Skeins assume 2 strands of DMC six-strand floss on {fabric}-count, plus 10% spare. Colours on screen are approximate.
      </p>
      {edited && (
        <button onClick={onReset} className="mt-2 text-sm font-semibold text-madder underline underline-offset-2">
          Undo all colour changes
        </button>
      )}
    </div>
  );
}

function FragmentRow({
  entry: c,
  fabric,
  open,
  onToggle,
  children,
}: {
  entry: PaletteEntry;
  fabric: FabricCount;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <tr className="border-b border-dashed border-charcoal/20">
        <td className="py-1.5 pr-2 font-[Helvetica,Arial,sans-serif] text-base font-bold">{c.symbol}</td>
        <td className="py-1.5 pr-2"><Swatch hex={c.hex} /></td>
        <td className="py-1.5 pr-2 font-semibold">{c.code}</td>
        <td className="py-1.5 pr-2">{c.name}</td>
        <td className="py-1.5 pr-2 text-right tabular-nums">{c.count.toLocaleString()}</td>
        <td className="py-1.5 pr-2 text-right tabular-nums">{skeinsNeeded(c.count, fabric)}</td>
        <td className="py-1.5 text-right">
          <button
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`Change DMC ${c.code} ${c.name}`}
            className="rounded-md border border-dashed border-hoop-dark/60 px-2 py-0.5 text-xs font-semibold hover:bg-aida-deep"
          >
            {open ? "Close" : "Change"}
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="py-2">{children}</td>
        </tr>
      )}
    </>
  );
}
