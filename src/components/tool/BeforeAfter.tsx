"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EMPTY } from "@/lib/color/cleanup";
import { hexToRgb } from "@/lib/color/lab";
import type { Pattern } from "@/lib/pattern/pipeline";
import type { SourceImage } from "@/lib/pattern/runner";

const FABRIC: [number, number, number] = [244, 239, 226];

/** Drag to compare the cropped photo with the pattern, one stitch per pixel scaled up crisply. */
export function BeforeAfter({ photo, pattern, maxHeight = 340 }: { photo: SourceImage; pattern: Pattern; maxHeight?: number }) {
  const id = useId();
  const [split, setSplit] = useState(50);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const patternRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = photoRef.current;
    if (!c) return;
    c.width = photo.width;
    c.height = photo.height;
    c.getContext("2d")?.putImageData(new ImageData(new Uint8ClampedArray(photo.pixels), photo.width, photo.height), 0, 0);
  }, [photo]);

  useEffect(() => {
    const c = patternRef.current;
    if (!c) return;
    c.width = pattern.width;
    c.height = pattern.height;
    const img = new ImageData(pattern.width, pattern.height);
    const rgb = pattern.palette.map((p) => hexToRgb(p.hex));
    pattern.cells.forEach((v, i) => img.data.set([...(v === EMPTY ? FABRIC : rgb[v]), 255], i * 4));
    c.getContext("2d")?.putImageData(img, 0, 0);
  }, [pattern]);

  return (
    <figure className="m-0">
      <div
        className="relative mx-auto overflow-hidden rounded-lg"
        style={{
          aspectRatio: `${pattern.width} / ${pattern.height * (pattern.cellAspect ?? 1)}`,
          maxHeight,
          maxWidth: (maxHeight * pattern.width) / (pattern.height * (pattern.cellAspect ?? 1)),
        }}
      >
        <canvas ref={patternRef} aria-hidden="true" className="absolute inset-0 h-full w-full [image-rendering:pixelated]" />
        <canvas
          ref={photoRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 bg-linen shadow" style={{ left: `${split}%` }} />
        <span className="pointer-events-none absolute left-1.5 top-1.5 rounded bg-charcoal/75 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-linen">
          Photo
        </span>
        <span className="pointer-events-none absolute right-1.5 top-1.5 rounded bg-charcoal/75 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-linen">
          Pattern
        </span>
      </div>
      <label htmlFor={id} className="sr-only">
        Compare your photo with the pattern
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={split}
        onChange={(e) => setSplit(Number(e.currentTarget.value))}
        className="mx-auto mt-2 block w-full max-w-sm accent-madder"
      />
      <figcaption className="text-center text-xs text-muted">Slide to compare your photo with the pattern</figcaption>
    </figure>
  );
}
