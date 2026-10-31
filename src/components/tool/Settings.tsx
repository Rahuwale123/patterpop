"use client";

import type { ReactNode } from "react";
import { MAX_WIDTH, MIN_WIDTH } from "@/lib/pattern/grid";
import type { PatternSettings } from "@/lib/pattern/pipeline";

export const MIN_COLOURS = 5;
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
        <Toggle id="set-cleanup" label="Clean up stray stitches" checked={value.cleanup} onChange={(v) => set("cleanup", v)} />
        <Toggle id="set-dither" label="Dithering" checked={value.dither} onChange={(v) => set("dither", v)} />
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
