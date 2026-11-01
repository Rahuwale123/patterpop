import type { Pattern, PatternSettings } from "@/lib/pattern/pipeline";

// Messages between the page and pattern.worker.ts. Kept in their own file so
// the page never imports the worker module itself.

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
