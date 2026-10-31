/// <reference lib="webworker" />
import { buildPattern, type Pattern, type PatternSettings } from "@/lib/pattern/pipeline";

export type WorkerRequest = {
  id: number;
  pixels: ArrayBuffer;
  width: number;
  height: number;
  settings: PatternSettings;
};

export type WorkerResponse =
  | { id: number; ok: true; pattern: Pattern; ms: number }
  | { id: number; ok: false; error: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, pixels, width, height, settings } = e.data;
  const t0 = performance.now();
  try {
    const pattern = buildPattern(new Uint8ClampedArray(pixels), width, height, settings);
    const msg: WorkerResponse = { id, ok: true, pattern, ms: performance.now() - t0 };
    ctx.postMessage(msg, [pattern.cells.buffer]);
  } catch (err) {
    const msg: WorkerResponse = { id, ok: false, error: err instanceof Error ? err.message : String(err) };
    ctx.postMessage(msg);
  }
};
