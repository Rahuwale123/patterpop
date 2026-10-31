"use client";

// Dev-only page: the `.dev.tsx` extension is only routed by `next dev`
// (see pageExtensions in next.config.ts), so it never reaches the static build.

import { useEffect, useState } from "react";
import { Settings } from "@/components/tool/Settings";
import { Preview } from "@/components/tool/Preview";
import { DEFAULT_SETTINGS, type Pattern, type PatternSettings } from "@/lib/pattern/pipeline";
import { loadSource, runPattern, type SourceImage } from "@/lib/pattern/runner";

const SAMPLES = [
  { id: "pet", src: "/samples/pet.jpg", label: "Pet" },
  { id: "portrait", src: "/samples/portrait.jpg", label: "Portrait" },
  { id: "flower", src: "/samples/flower.jpg", label: "Flower" },
];

type Result = { pattern: Pattern; ms: number } | { error: string };

export default function ComparePage() {
  const [settings, setSettings] = useState<PatternSettings>(DEFAULT_SETTINGS);
  const [sources, setSources] = useState<Record<string, SourceImage>>({});
  const [results, setResults] = useState<Record<string, Result>>({});

  useEffect(() => {
    Promise.all(SAMPLES.map(async (s) => [s.id, await loadSource(s.src)] as const)).then((entries) =>
      setSources(Object.fromEntries(entries)),
    );
  }, []);

  useEffect(() => {
    if (Object.keys(sources).length !== SAMPLES.length) return;
    let cancelled = false;
    const t = setTimeout(() => {
      for (const s of SAMPLES) {
        runPattern(sources[s.id], settings)
          .then((r) => !cancelled && setResults((prev) => ({ ...prev, [s.id]: r })))
          .catch((e: Error) => !cancelled && setResults((prev) => ({ ...prev, [s.id]: { error: e.message } })));
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [sources, settings]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <h1 className="font-serif text-3xl font-bold">Pipeline compare (dev only)</h1>
      <div className="mt-4 max-w-md rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen p-4">
        <Settings value={settings} onChange={setSettings} />
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
          Seed
          <input
            type="number"
            value={settings.seed}
            onChange={(e) => setSettings({ ...settings, seed: Number(e.currentTarget.value) || 1 })}
            className="w-20 rounded border border-charcoal/30 px-2 py-1"
          />
        </label>
      </div>
      <div className="mt-8 space-y-12">
        {SAMPLES.map((s) => {
          const r = results[s.id];
          return (
            <section key={s.id}>
              <h2 className="font-serif text-2xl font-bold">
                {s.label}
                {r && "pattern" in r && (
                  <span className="ml-3 font-sans text-sm font-normal text-muted">
                    {r.pattern.width} × {r.pattern.height}, {r.pattern.palette.length} colours, {Math.round(r.ms)} ms
                  </span>
                )}
              </h2>
              <div className="mt-3 grid gap-4 lg:grid-cols-[300px_1fr_1fr]">
                <img src={s.src} alt={`${s.label} sample photo`} width={300} height={300} className="w-full rounded-lg" />
                {r && "pattern" in r ? (
                  <>
                    <Preview pattern={r.pattern} label={s.label} height={420} />
                    <Preview pattern={r.pattern} label={`${s.label} chart`} initialView="chart" height={420} />
                  </>
                ) : (
                  <p className="text-muted">{r && "error" in r ? `Error: ${r.error}` : "Working…"}</p>
                )}
              </div>
              {r && "pattern" in r && (
                <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                  {r.pattern.palette.map((c) => (
                    <li key={c.code} className="flex items-center gap-1 rounded border border-charcoal/20 bg-linen px-1.5 py-1">
                      <span className="inline-block h-4 w-4 rounded-sm border border-black/20" style={{ background: c.hex }} />
                      <b>{c.symbol}</b> DMC {c.code} · {c.name} · {c.count}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
