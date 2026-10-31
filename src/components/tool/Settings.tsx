"use client";

import clsx from "clsx";
import { useState } from "react";
import { MAX_WIDTH, MIN_WIDTH } from "@/lib/pattern/grid";
import type { PatternSettings } from "@/lib/pattern/pipeline";
import { SKIN_WARMTH_MAX, SKIN_WARMTH_MIN } from "@/lib/color/whitebalance";
import { CM_PER_INCH, FABRIC_COUNTS, type FabricCount } from "@/lib/pattern/fabric";

export const MIN_COLOURS = 5;
// TODO(pro): a Pro licence key could lift these limits (wider than MAX_WIDTH, more than 40 colours).
export const MAX_COLOURS = 40;

const DETAIL_PRESETS = [
  { label: "Simple", width: 60 },
  { label: "Detailed", width: 100 },
  { label: "Very detailed", width: 150 },
] as const;

type SizeMode = "stitches" | "size";
type Unit = "in" | "cm";

type Props = {
  value: PatternSettings;
  onChange: (next: PatternSettings) => void;
  /** Leave out fabric to hide fabric count and the finished-size mode (e.g. on the dev compare page). */
  fabric?: FabricCount;
  onFabricChange?: (f: FabricCount) => void;
  /** Height / width of the cropped photo, to show the height in stitches */
  aspect?: number;
};

function Range(props: {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="flex justify-between text-sm font-semibold">
        <span>{props.label}</span>
        <output htmlFor={props.id}>
          {props.value} {props.suffix}
        </output>
      </label>
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.currentTarget.value))}
        className="mt-1 w-full accent-madder"
      />
    </div>
  );
}

function Toggle(props: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={props.id} className="flex items-center gap-2 text-sm font-semibold">
      <input
        id={props.id}
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
        className="h-4 w-4 shrink-0 accent-madder"
      />
      {props.label}
    </label>
  );
}

function Segmented<T extends string>(props: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={props.label} className="flex rounded-lg border border-hoop-dark/50 p-0.5 text-sm font-semibold">
      {props.options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={props.value === o.value}
          onClick={() => props.onChange(o.value)}
          className={clsx("flex-1 rounded-md px-2 py-1", props.value === o.value ? "bg-madder text-linen" : "hover:bg-aida-deep")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const clampWidth = (w: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(w)));

export function Settings({ value, onChange, fabric, onFabricChange, aspect }: Props) {
  const set = <K extends keyof PatternSettings>(k: K, v: PatternSettings[K]) => onChange({ ...value, [k]: v });
  const [mode, setMode] = useState<SizeMode>("stitches");
  const [unit, setUnit] = useState<Unit>("in");
  // What the user typed in "By finished size", kept as text so typing isn't fought
  const [sizeText, setSizeText] = useState(() => (fabric ? (value.width / fabric).toFixed(1) : ""));

  const heightStitches = aspect ? Math.max(1, Math.round(value.width * aspect)) : undefined;
  const toInches = (v: number, u: Unit) => (u === "in" ? v : v / CM_PER_INCH);
  const typedInches = toInches(Number(sizeText), unit);
  const wanted = fabric && typedInches > 0 ? Math.round(typedInches * fabric) : undefined;

  const applySize = (text: string, u: Unit, f: FabricCount) => {
    const inches = toInches(Number(text), u);
    if (inches > 0) set("width", clampWidth(inches * f));
  };

  const changeFabric = (f: FabricCount) => {
    onFabricChange?.(f);
    // In "By finished size", keep the size and change the stitch count instead.
    if (mode === "size") applySize(sizeText, unit, f);
  };

  const fmt = (n: number) => n.toFixed(1);

  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">Pattern settings</legend>

      {fabric && (
        <Segmented
          label="Choose the size"
          value={mode}
          onChange={(m) => {
            setMode(m);
            if (m === "size") setSizeText(fmt(unit === "in" ? value.width / fabric : (value.width / fabric) * CM_PER_INCH));
          }}
          options={[
            { value: "stitches", label: "By stitches" },
            { value: "size", label: "By finished size" },
          ]}
        />
      )}

      {mode === "stitches" || !fabric ? (
        <div>
          <Range
            id="set-width"
            label="Width"
            min={MIN_WIDTH}
            max={MAX_WIDTH}
            value={value.width}
            suffix="stitches"
            onChange={(v) => set("width", v)}
          />
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Detail presets">
            {DETAIL_PRESETS.map((p) => (
              <button
                key={p.width}
                type="button"
                aria-pressed={value.width === p.width}
                onClick={() => set("width", p.width)}
                className={clsx(
                  "rounded-full border border-dashed px-2.5 py-0.5 text-xs font-semibold",
                  value.width === p.width ? "border-madder bg-madder text-linen" : "border-hoop-dark/60 hover:bg-aida-deep",
                )}
              >
                {p.label} {p.width}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="set-size" className="text-sm font-semibold">
            Finished width
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="set-size"
              type="number"
              inputMode="decimal"
              min={0.5}
              step={0.5}
              value={sizeText}
              onChange={(e) => {
                setSizeText(e.currentTarget.value);
                applySize(e.currentTarget.value, unit, fabric);
              }}
              className="w-24 rounded-md border border-charcoal/30 bg-linen px-2 py-1.5"
            />
            <select
              aria-label="Unit"
              value={unit}
              onChange={(e) => {
                const u = e.currentTarget.value as Unit;
                const inches = toInches(Number(sizeText), unit);
                const text = fmt(u === "in" ? inches : inches * CM_PER_INCH);
                setUnit(u);
                setSizeText(text);
              }}
              className="rounded-md border border-charcoal/30 bg-linen px-2 py-1.5"
            >
              <option value="in">inches</option>
              <option value="cm">cm</option>
            </select>
          </div>
          {wanted !== undefined && wanted !== value.width && (
            <p className="mt-1 text-xs text-madder">
              That needs {wanted} stitches; the tool allows {MIN_WIDTH}–{MAX_WIDTH}. Try a {wanted > MAX_WIDTH ? "higher" : "lower"} fabric count.
            </p>
          )}
        </div>
      )}

      {fabric && onFabricChange && (
        <div>
          <label htmlFor="set-fabric" className="text-sm font-semibold">
            Fabric count (stitches per inch)
          </label>
          <select
            id="set-fabric"
            value={fabric}
            onChange={(e) => changeFabric(Number(e.currentTarget.value) as FabricCount)}
            aria-describedby="set-fabric-help"
            className="mt-1 w-full rounded-md border border-charcoal/30 bg-linen px-2 py-1.5"
          >
            {FABRIC_COUNTS.map((c) => (
              <option key={c} value={c}>
                {c}-count Aida
              </option>
            ))}
          </select>
          <p id="set-fabric-help" className="mt-1 text-xs text-muted">
            Changes the finished size, not the detail.
          </p>
        </div>
      )}

      {fabric && (
        <p className="rounded-md bg-aida px-2 py-1.5 text-sm" aria-live="polite">
          <strong>
            {value.width}
            {heightStitches ? ` × ${heightStitches}` : ""} stitches
          </strong>{" "}
          = {fmt(value.width / fabric)}
          {heightStitches ? ` × ${fmt(heightStitches / fabric)}` : ""} in ({fmt((value.width / fabric) * CM_PER_INCH)}
          {heightStitches ? ` × ${fmt((heightStitches / fabric) * CM_PER_INCH)}` : ""} cm)
        </p>
      )}

      <Range
        id="set-colours"
        label="Colours"
        min={MIN_COLOURS}
        max={MAX_COLOURS}
        value={value.maxColours}
        suffix="max"
        onChange={(v) => set("maxColours", v)}
      />

      <div className="space-y-2">
        <Toggle
          id="set-portrait"
          label="Portrait mode (more detail and natural skin on faces)"
          checked={value.portrait}
          onChange={(v) => set("portrait", v)}
        />
        {value.portrait && (
          <div className="pl-6">
            <label htmlFor="set-warmth" className="flex justify-between text-sm font-semibold">
              <span>Skin warmth</span>
              <output htmlFor="set-warmth">{value.skinWarmth > 0 ? `+${value.skinWarmth}` : value.skinWarmth}</output>
            </label>
            <input
              id="set-warmth"
              type="range"
              min={SKIN_WARMTH_MIN}
              max={SKIN_WARMTH_MAX}
              step={1}
              value={value.skinWarmth}
              onChange={(e) => set("skinWarmth", Number(e.currentTarget.value))}
              className="mt-1 w-full accent-madder"
              aria-describedby="set-warmth-ends"
            />
            <div id="set-warmth-ends" className="flex justify-between text-xs text-muted">
              <span>Cooler</span>
              <span>Warmer</span>
            </div>
          </div>
        )}
        <Toggle
          id="set-simplify"
          label="Simplify background (more colours for the subject)"
          checked={value.simplifyBackground}
          onChange={(v) => set("simplifyBackground", v)}
        />
        <Toggle id="set-cleanup" label="Clean up stray stitches" checked={value.cleanup} onChange={(v) => set("cleanup", v)} />
        <Toggle
          id="set-dither"
          label="Dithering"
          checked={value.dither}
          // Cleanup removes the scattered stitches dithering relies on, so switch it off (it can be turned back on).
          onChange={(v) => onChange(v ? { ...value, dither: true, cleanup: false } : { ...value, dither: false })}
        />
        <p className="-mt-1 pl-6 text-xs text-muted">
          Mixes two close threads to fake in-between shades. Good for skies and soft gradients; can make faces speckled.
        </p>
        <Toggle
          id="set-bg"
          label="Leave white background unstitched"
          checked={value.skipWhiteBackground}
          onChange={(v) => set("skipWhiteBackground", v)}
        />
      </div>
    </fieldset>
  );
}
