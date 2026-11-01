"use client";

import { createStore, del, get, set } from "idb-keyval";
import type { FabricCount } from "@/lib/pattern/fabric";
import type { Gauge } from "@/lib/crafts";
import type { ColourEdit } from "@/lib/pattern/edit";
import type { PatternSettings } from "@/lib/pattern/pipeline";
import type { CropRect, SourceImage } from "@/lib/pattern/runner";

// Only the most recent project per tool is kept, on this device only.
const store = typeof indexedDB === "undefined" ? undefined : createStore("patternpop", "projects");
/** The cross stitch maker keeps the original key so existing saved projects still open. */
const keyFor = (craft: string) => (craft === "cross-stitch" ? "last" : `last-${craft}`);

export type SavedProject = {
  version: 1;
  savedAt: number;
  /** The downscaled photo before cropping. Lossless, so a restored pattern comes out identical. */
  source: Blob;
  crop: CropRect;
  settings: PatternSettings;
  fabric: FabricCount;
  gauge?: Gauge;
  edits: ColourEdit[];
};

export async function encodeSource(src: SourceImage): Promise<Blob> {
  const canvas = new OffscreenCanvas(src.width, src.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");
  ctx.putImageData(new ImageData(new Uint8ClampedArray(src.pixels), src.width, src.height), 0, 0);
  return canvas.convertToBlob({ type: "image/png" });
}

export async function saveProject(craft: string, p: SavedProject): Promise<void> {
  if (!store) return;
  try {
    await set(keyFor(craft), p, store);
  } catch {
    // Private browsing or storage full: saving is a nice-to-have, so stay quiet.
  }
}

export async function loadProject(craft: string): Promise<SavedProject | null> {
  if (!store) return null;
  try {
    const p = await get<SavedProject>(keyFor(craft), store);
    return p?.version === 1 ? p : null;
  } catch {
    return null;
  }
}

export async function clearProject(craft: string): Promise<void> {
  if (!store) return;
  try {
    await del(keyFor(craft), store);
  } catch {
    // ignore
  }
}
