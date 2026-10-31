"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Pattern } from "@/lib/pattern/pipeline";
import { drawChart, drawRealistic, type View } from "@/lib/pattern/render";

const ZOOMS = [3, 4, 6, 8, 10, 12, 16, 20, 24] as const;
const MAX_CANVAS_SIDE = 4096;

type Props = {
  pattern: Pattern;
  initialView?: View;
  initialZoom?: number;
  height?: number;
  label: string;
};

export function Preview({ pattern, initialView = "realistic", initialZoom = 2, height = 480, label }: Props) {
  const [view, setView] = useState<View>(initialView);
  const [zoomIdx, setZoomIdx] = useState(initialZoom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);

  // Chart symbols need room; bump small zooms up when on the chart tab.
  const maxCell = Math.floor(MAX_CANVAS_SIDE / Math.max(pattern.width, pattern.height));
  const wanted = view === "chart" ? Math.max(ZOOMS[zoomIdx], 12) : ZOOMS[zoomIdx];
  const cell = Math.min(wanted, maxCell);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const scale = Math.min(dpr, MAX_CANVAS_SIDE / (Math.max(pattern.width, pattern.height) * cell));
    canvas.width = Math.round(pattern.width * cell * scale);
    canvas.height = Math.round(pattern.height * cell * scale);
    canvas.style.width = `${pattern.width * cell}px`;
    canvas.style.height = `${pattern.height * cell}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (view === "chart") drawChart(ctx, pattern, cell);
    else drawRealistic(ctx, pattern, cell);
  }, [pattern, view, cell]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !scrollRef.current) return; // touch uses native scrolling
    drag.current = { x: e.clientX, y: e.clientY, sl: scrollRef.current.scrollLeft, st: scrollRef.current.scrollTop };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !scrollRef.current) return;
    scrollRef.current.scrollLeft = d.sl - (e.clientX - d.x);
    scrollRef.current.scrollTop = d.st - (e.clientY - d.y);
  };
  const onUp = () => (drag.current = null);

  return (
    <div className="min-w-0 rounded-xl border-2 border-dashed border-hoop-dark/50 bg-linen">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-hoop-dark/40 p-2">
        <div role="tablist" aria-label={`${label} view`} className="flex gap-1">
          {(["realistic", "chart"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={clsx(
                "rounded-md px-3 py-1.5 text-sm font-semibold capitalize",
                view === v ? "bg-madder text-linen" : "hover:bg-aida-deep",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
            disabled={zoomIdx === 0}
            aria-label="Zoom out"
            className="h-8 w-8 rounded-md text-lg font-bold hover:bg-aida-deep disabled:opacity-40"
          >
            −
          </button>
          <button
            onClick={() => setZoomIdx((z) => Math.min(ZOOMS.length - 1, z + 1))}
            disabled={zoomIdx === ZOOMS.length - 1 || cell >= maxCell}
            aria-label="Zoom in"
            className="h-8 w-8 rounded-md text-lg font-bold hover:bg-aida-deep disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label={`${label} preview, scroll to pan`}
        className="cursor-grab overflow-auto active:cursor-grabbing"
        style={{ height }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} role="img" aria-label={`${label} as a cross stitch ${view} view`} className="block" />
      </div>
    </div>
  );
}
