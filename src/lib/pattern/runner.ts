"use client";

import type { Pattern, PatternSettings } from "./pipeline";
import type { WorkerRequest, WorkerResponse } from "@/workers/messages";

export const MAX_SOURCE_SIDE = 1600;

export type SourceImage = { pixels: Uint8ClampedArray; width: number; height: number };

/** Decode an image and downscale so the longest side is at most 1600px. */
export async function loadSource(src: Blob | string): Promise<SourceImage> {
  const blob = typeof src === "string" ? await (await fetch(src)).blob() : src;
  const bmp = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_SOURCE_SIDE / Math.max(bmp.width, bmp.height));
  const width = Math.max(1, Math.round(bmp.width * scale));
  const height = Math.max(1, Math.round(bmp.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available in this browser");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  return { pixels: ctx.getImageData(0, 0, width, height).data, width, height };
}

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (r: { pattern: Pattern; ms: number }) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("../../workers/pattern.worker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    if (msg.ok) p.resolve({ pattern: msg.pattern, ms: msg.ms });
    else p.reject(new Error(msg.error));
  };
  worker.onerror = (e) => {
    const err = new Error(e.message || "The pattern worker failed to start");
    for (const p of pending.values()) p.reject(err);
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

/** Run the colour pipeline off the main thread. The source pixels are copied, not transferred. */
export function runPattern(src: SourceImage, settings: PatternSettings): Promise<{ pattern: Pattern; ms: number }> {
  const id = nextId++;
  const pixels = src.pixels.slice().buffer;
  const req: WorkerRequest = { id, pixels, width: src.width, height: src.height, settings };
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage(req, [pixels]);
  });
}

/** Crop rectangle in 0..1 units of the source image. */
export type CropRect = { x: number; y: number; w: number; h: number };

export function cropSource(src: SourceImage, r: CropRect): SourceImage {
  const x0 = Math.max(0, Math.round(r.x * src.width));
  const y0 = Math.max(0, Math.round(r.y * src.height));
  const w = Math.max(1, Math.min(src.width - x0, Math.round(r.w * src.width)));
  const h = Math.max(1, Math.min(src.height - y0, Math.round(r.h * src.height)));
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const from = ((y0 + y) * src.width + x0) * 4;
    out.set(src.pixels.subarray(from, from + w * 4), y * w * 4);
  }
  return { pixels: out, width: w, height: h };
}

function isHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

/** Decode an uploaded file. HEIC (iPhone photos) pulls in heic2any only when needed. */
export async function loadFile(file: File): Promise<SourceImage> {
  if (!isHeic(file)) return loadSource(file);
  try {
    // Some browsers (Safari) can decode HEIC natively.
    return await loadSource(file);
  } catch {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    return loadSource(Array.isArray(converted) ? converted[0] : converted);
  }
}
