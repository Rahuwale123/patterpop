"use client";

import type { ReactNode } from "react";
import { MAX_WIDTH, MIN_WIDTH } from "@/lib/pattern/grid";
import type { PatternSettings } from "@/lib/pattern/pipeline";
import { SKIN_WARMTH_MAX, SKIN_WARMTH_MIN } from "@/lib/color/whitebalance";

export const MIN_COLOURS = 5;
// TODO(pro): a Pro licence key could lift these limits (wider than MAX_WIDTH, more than 40 colours).
export const MAX_COLOURS = 40;

type Props = {
  value: PatternSettings;
  onChange: (next: PatternSettings) => void;
  children?: ReactNode;
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
        className="h-4 w-4 accent-madder"
      />
      {props.label}
    </label>
  );
}

export function Settings({ value, onChange, children }: Props) {
  const set = <K extends keyof PatternSettings>(k: K, v: PatternSettings[K]) => onChange({ ...value, [k]: v });
  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">Pattern settings</legend>
      <Range
        id="set-width"
        label="Width"
        min={MIN_WIDTH}
        max={MAX_WIDTH}
        value={value.width}
        suffix="stitches"
        onChange={(v) => set("width", v)}
      />
      <Range
        id="set-colours"
        label="Colours"
        min={MIN_COLOURS}
        max={MAX_COLOURS}
        value={value.maxColours}
        suffix="max"
        onChange={(v) => set("maxColours", v)}
      />
      {children}
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
        <Toggle id="set-cleanup" label="Clean up stray stitches" checked={value.cleanup} onChange={(v) => set("cleanup", v)} />
        <Toggle
          id="set-dither"
          label="Dithering"
          checked={value.dither}
          // Cleanup removes the scattered stitches dithering relies on, so switch it off (it can be turned back on).
          onChange={(v) => onChange(v ? { ...value, dither: true, cleanup: false } : { ...value, dither: false })}
        />
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
