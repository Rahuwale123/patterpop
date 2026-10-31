"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { CropRect, SourceImage } from "@/lib/pattern/runner";

const PRESETS = [
  { id: "free", label: "Free", ratio: null },
  { id: "square", label: "Square", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
] as const;
type PresetId = (typeof PRESETS)[number]["id"];

type Handle = "move" | "nw" | "ne" | "sw" | "se";
const MIN = 0.08;

/** Largest centred rect with the given pixel aspect ratio (w/h). */
function fitRatio(src: SourceImage, ratio: number | null): CropRect {
  if (ratio === null) return { x: 0, y: 0, w: 1, h: 1 };
  const imgRatio = src.width / src.height;
  if (imgRatio > ratio) {
    const w = ratio / imgRatio;
    return { x: (1 - w) / 2, y: 0, w, h: 1 };
  }
  const h = imgRatio / ratio;
  return { x: 0, y: (1 - h) / 2, w: 1, h };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Props = {
  source: SourceImage;
  initial?: CropRect;
  onDone: (rect: CropRect) => void;
  onCancel: () => void;
};

export function Cropper({ source, initial, onDone, onCancel }: Props) {
  const [preset, setPreset] = useState<PresetId>("free");
  const [rect, setRect] = useState<CropRect>(initial ?? { x: 0, y: 0, w: 1, h: 1 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ handle: Handle; px: number; py: number; start: CropRect } | null>(null);
  const ratio = PRESETS.find((p) => p.id === preset)?.ratio ?? null;
  // Normalised-units aspect: h_n = w_n * k for the locked ratio.
  const k = ratio ? source.width / (source.height * ratio) : 0;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = source.width;
    c.height = source.height;
    c.getContext("2d")?.putImageData(new ImageData(new Uint8ClampedArray(source.pixels), source.width, source.height), 0, 0);
  }, [source]);

  const choose = (id: PresetId) => {
    setPreset(id);
    setRect(fitRatio(source, PRESETS.find((p) => p.id === id)?.ratio ?? null));
  };

  const onDown = (e: PointerEvent<HTMLElement>) => {
    const handle = (e.target as HTMLElement).dataset.handle as Handle | undefined;
    if (!handle) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { handle, px: e.clientX, py: e.clientY, start: rect };
  };

  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    const box = boxRef.current?.getBoundingClientRect();
    if (!d || !box) return;
    const dx = (e.clientX - d.px) / box.width;
    const dy = (e.clientY - d.py) / box.height;
    const s = d.start;
    if (d.handle === "move") {
      setRect({ ...s, x: clamp(s.x + dx, 0, 1 - s.w), y: clamp(s.y + dy, 0, 1 - s.h) });
      return;
    }
    const west = d.handle.includes("w");
    const north = d.handle.includes("n");
    // Fixed corner opposite the one being dragged
    const ax = west ? s.x + s.w : s.x;
    const ay = north ? s.y + s.h : s.y;
    const maxW = west ? ax : 1 - ax;
    const maxH = north ? ay : 1 - ay;
    let w = clamp(s.w + (west ? -dx : dx), MIN, maxW);
    let h = clamp(s.h + (north ? -dy : dy), MIN, maxH);
    if (k) {
      h = w * k;
      if (h > maxH) {
        h = maxH;
        w = h / k;
      }
    }
    setRect({ x: west ? ax - w : ax, y: north ? ay - h : ay, w, h });
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.05 : 0.01;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    setRect((r) => ({ ...r, x: clamp(r.x + m[0], 0, 1 - r.w), y: clamp(r.y + m[1], 0, 1 - r.h) }));
  };

  const pct = (v: number) => `${v * 100}%`;
  const corners: Handle[] = ["nw", "ne", "sw", "se"];

  return (
    <div className="mx-auto max-w-[640px]">
      <h2 className="text-center font-serif text-2xl font-bold">Crop your photo</h2>
      <p className="mt-1 text-center text-sm text-muted">
        Drag the box to move it, or a corner to resize. Fill it with the part you want to stitch.
      </p>
      <div role="radiogroup" aria-label="Crop shape" className="mt-4 flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={preset === p.id}
            onClick={() => choose(p.id)}
            className={clsx(
              "rounded-full border-2 border-dashed px-4 py-1.5 text-sm font-semibold",
              preset === p.id ? "border-madder bg-madder text-linen" : "border-hoop-dark/50 hover:bg-aida-deep",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <div ref={boxRef} className="relative touch-none select-none" onPointerMove={onMove} onPointerUp={() => (drag.current = null)}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Your photo"
            className="block max-h-[60vh] w-auto max-w-full rounded-md"
          />
          {/* Dimming outside the crop, clipped to the photo */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
            <div
              className="absolute shadow-[0_0_0_9999px_rgb(43_41_38/0.55)]"
              style={{ left: pct(rect.x), top: pct(rect.y), width: pct(rect.w), height: pct(rect.h) }}
            />
          </div>
          <div
            tabIndex={0}
            role="group"
            aria-label="Crop area. Use the arrow keys to move it."
            onKeyDown={onKey}
            data-handle="move"
            onPointerDown={onDown}
            className="absolute cursor-move border-2 border-dashed border-linen"
            style={{ left: pct(rect.x), top: pct(rect.y), width: pct(rect.w), height: pct(rect.h) }}
          >
            {corners.map((c) => (
              <span
                key={c}
                aria-hidden="true"
                data-handle={c}
                className={clsx(
                  "absolute h-5 w-5 rounded-full border-2 border-linen bg-madder",
                  c.includes("n") ? "-top-2.5" : "-bottom-2.5",
                  c.includes("w") ? "-left-2.5" : "-right-2.5",
                  c === "nw" || c === "se" ? "cursor-nwse-resize" : "cursor-nesw-resize",
                )}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-3">
        <button onClick={onCancel} className="rounded-lg px-4 py-2 font-semibold hover:bg-aida-deep">
          Choose another photo
        </button>
        <button
          onClick={() => onDone(rect)}
          className="rounded-lg bg-madder px-5 py-2 font-semibold text-linen hover:bg-madder-dark"
        >
          Make my pattern
        </button>
      </div>
    </div>
  );
}
