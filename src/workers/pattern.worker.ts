/// <reference lib="webworker" />
import { buildPattern } from "@/lib/pattern/pipeline";
import type { WorkerRequest, WorkerResponse } from "./messages";

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
