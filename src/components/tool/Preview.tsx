"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Pattern } from "@/lib/pattern/pipeline";
import { drawChart, drawRealistic, type View } from "@/lib/pattern/render";

// Zoom levels for the − / + buttons, in screen pixels per stitch. Pinching can land anywhere between.
const ZOOMS = [3, 4, 6, 8, 10, 12, 16, 20, 24] as const;
const MIN_CELL = ZOOMS[0];
const MAX_CELL = ZOOMS[ZOOMS.length - 1];
const MAX_CANVAS_SIDE = 4096;

type Props = {
  pattern: Pattern;
  initialView?: View;
  /** Index into ZOOMS; leave out to start fitted to the box */
  initialZoom?: number;
  height?: number;
  label: string;
};

type Pinch = {
  d0: number;
  mid0: { x: number; y: number };
  /** Point under the fingers at the start, in stitch units */
  anchor: { x: number; y: number };
  cell0: number;
  scale: number;
  mid: { x: number; y: number };
};

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export function Preview({ pattern, initialView = "realistic", initialZoom, height = 480, label }: Props) {
  const [view, setView] = useState<View>(initialView);
  // null = fit the whole pattern in the box
  const [zoom, setZoom] = useState<number | null>(initialZoom === undefined ? null : ZOOMS[initialZoom]);
  const [boxW, setBoxW] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);
  const pinch = useRef<Pinch | null>(null);
  // Latest zoom values for the native touch listeners, which are attached once.
  const zoomRef = useRef({ cell: 0, maxCell: 0, minCell: 1 });
  // After a pinch, the scroll position to restore once the canvas is redrawn at the new size
  const pendingScroll = useRef<{ left: number; top: number } | null>(null);

  // Chart symbols need room; bump small zooms up when on the chart tab.
  const maxCell = Math.min(MAX_CELL, Math.floor(MAX_CANVAS_SIDE / Math.max(pattern.width, pattern.height)));
  const fitCell = boxW
    ? Math.max(1, Math.floor(Math.min((boxW - 2) / pattern.width, (height - 2) / pattern.height) * 4) / 4)
    : ZOOMS[2];
  const minCell = Math.min(MIN_CELL, fitCell);
  const base = zoom ?? fitCell;
  const cell = Math.min(view === "chart" ? Math.max(base, 12) : base, maxCell);

  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => setBoxW(box.clientWidth));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const scale = Math.min(dpr, MAX_CANVAS_SIDE / (Math.max(pattern.width, pattern.height) * cell));
    canvas.width = Math.round(pattern.width * cell * scale);
    canvas.height = Math.round(pattern.height * cell * scale);
    canvas.style.width = `${pattern.width * cell}px`;
    canvas.style.height = `${pattern.height * cell}px`;
    canvas.style.transform = "";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (view === "chart") drawChart(ctx, pattern, cell);
    else drawRealistic(ctx, pattern, cell);
    const ps = pendingScroll.current;
    if (ps && scrollRef.current) {
      scrollRef.current.scrollLeft = ps.left;
      scrollRef.current.scrollTop = ps.top;
      pendingScroll.current = null;
    }
  }, [pattern, view, cell]);

  const stepZoom = (dir: 1 | -1) => {
    const next = dir > 0 ? ZOOMS.find((z) => z > cell) : [...ZOOMS].reverse().find((z) => z < cell);
    setZoom(next ?? (dir < 0 ? null : cell));
  };

  useEffect(() => {
    zoomRef.current = { cell, maxCell, minCell };
  }, [cell, maxCell, minCell]);

  // Two-finger pinch and pan. Native listeners, because only they may call
  // preventDefault to stop the browser zooming the page. One finger is left
  // alone so it scrolls natively, with momentum.
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    const pts = (e: TouchEvent) => [0, 1].map((i) => ({ x: e.touches[i].clientX, y: e.touches[i].clientY }));

    const onStart = (e: TouchEvent) => {
      const canvas = canvasRef.current;
      if (e.touches.length !== 2 || !canvas) return;
      e.preventDefault();
      const [a, b] = pts(e);
      const r = canvas.getBoundingClientRect();
      const mid0 = midpoint(a, b);
      const { cell: c } = zoomRef.current;
      pinch.current = {
        d0: Math.max(1, dist(a, b)),
        mid0,
        anchor: { x: (mid0.x - r.left) / c, y: (mid0.y - r.top) / c },
        cell0: c,
        scale: 1,
        mid: mid0,
      };
      canvas.style.transformOrigin = `${mid0.x - r.left}px ${mid0.y - r.top}px`;
    };

    const onMove = (e: TouchEvent) => {
      const p = pinch.current;
      if (!p || e.touches.length < 2) return;
      e.preventDefault();
      const [a, b] = pts(e);
      p.mid = midpoint(a, b);
      p.scale = Math.min(zoomRef.current.maxCell / p.cell0, Math.max(zoomRef.current.minCell / p.cell0, dist(a, b) / p.d0));
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate(${p.mid.x - p.mid0.x}px, ${p.mid.y - p.mid0.y}px) scale(${p.scale})`;
      }
    };

    const onEnd = (e: TouchEvent) => {
      const p = pinch.current;
      if (!p || e.touches.length >= 2) return;
      pinch.current = null;
      const { cell: c, maxCell: m, minCell: lo } = zoomRef.current;
      const next = Math.round(Math.min(m, Math.max(lo, p.cell0 * p.scale)) * 2) / 2;
      const r = box.getBoundingClientRect();
      // Keep the stitch that was under the fingers under their final midpoint.
      const target = {
        left: Math.max(0, p.anchor.x * next - (p.mid.x - r.left)),
        top: Math.max(0, p.anchor.y * next - (p.mid.y - r.top)),
      };
      if (canvasRef.current) canvasRef.current.style.transform = "";
      if (next === c) {
        box.scrollLeft = target.left;
        box.scrollTop = target.top;
      } else {
        pendingScroll.current = target;
        setZoom(next);
      }
    };

    box.addEventListener("touchstart", onStart, { passive: false });
    box.addEventListener("touchmove", onMove, { passive: false });
    box.addEventListener("touchend", onEnd);
    box.addEventListener("touchcancel", onEnd);
    return () => {
      box.removeEventListener("touchstart", onStart);
      box.removeEventListener("touchmove", onMove);
      box.removeEventListener("touchend", onEnd);
      box.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  // Mouse: click and drag to pan.
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !scrollRef.current) return;
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
            onClick={() => setZoom(null)}
            disabled={zoom === null}
            className="h-8 rounded-md px-2 text-sm font-semibold hover:bg-aida-deep disabled:opacity-40"
          >
            Fit
          </button>
          <button
            onClick={() => stepZoom(-1)}
            disabled={cell <= minCell}
            aria-label="Zoom out"
            className="h-8 w-8 rounded-md text-lg font-bold hover:bg-aida-deep disabled:opacity-40"
          >
            −
          </button>
          <button
            onClick={() => stepZoom(1)}
            disabled={cell >= maxCell}
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
        aria-label={`${label} preview. Scroll or drag to move around, pinch or use the buttons to zoom.`}
        // One finger scrolls natively; two-finger pinch and pan are handled here instead of zooming the page.
        className="relative cursor-grab touch-pan-x touch-pan-y overflow-auto active:cursor-grabbing"
        style={{ height }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} role="img" aria-label={`${label} as a cross stitch ${view} view`} className="m-auto block" />
      </div>
    </div>
  );
}
