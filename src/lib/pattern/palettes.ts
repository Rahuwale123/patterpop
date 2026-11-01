import dmcData from "@/data/dmc.json";
import perlerData from "@/data/perler.json";
import { hexToLab, labToRgb, type Lab } from "@/lib/color/lab";
import { chromaHue, isSkinSafeThread } from "@/lib/color/skin";

/** Which colours a pattern is matched to. "free" keeps the photo's own colours (for yarn). */
export type PaletteId = "dmc" | "perler" | "free";

export type Colour = { code: string; name: string; hex: string; lab: Lab };

export type Palette = {
  id: PaletteId;
  colours: Colour[];
  /** All colours as flat L,a,b triples, for fast nearest-colour searches */
  lab: Float64Array;
  /** 1 where a colour may be used for skin (see lib/color/skin) */
  skinSafe: Uint8Array;
};

type Raw = { code: string; name: string; hex: string };

function make(id: PaletteId, list: Raw[]): Palette {
  const colours = list.map((c) => ({ ...c, lab: hexToLab(c.hex) }));
  return {
    id,
    colours,
    lab: Float64Array.from(colours.flatMap((c) => c.lab)),
    skinSafe: Uint8Array.from(colours, (c) => (id === "free" || isSkinSafeThread(...c.lab) ? 1 : 0)),
  };
}

const brands = {
  dmc: () => make("dmc", dmcData.colors as Raw[]),
  perler: () => make("perler", perlerData.colors as Raw[]),
};
const cache = new Map<PaletteId, Palette>();

export function brandPalette(id: "dmc" | "perler"): Palette {
  let p = cache.get(id);
  if (!p) cache.set(id, (p = brands[id]()));
  return p;
}

/** An empty palette that grows as colours are added (yarn: no fixed colour range). */
export function freePalette(): Palette {
  return make("free", []);
}

export function labToHex(L: number, a: number, b: number): string {
  return "#" + labToRgb(L, a, b).map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// Hue bands in Lab degrees. Reds run up to about 40 degrees in Lab.
const HUES: [number, string][] = [
  [40, "red"], [62, "orange"], [100, "yellow"], [135, "olive"], [190, "green"],
  [225, "teal"], [285, "blue"], [320, "purple"], [345, "pink"], [360, "red"],
];

/** A plain-words name for a colour, e.g. "Dark green", for yarn shopping lists. */
export function describeColour(L: number, a: number, b: number): string {
  const { C, h } = chromaHue(a, b);
  const tone = L < 30 ? "Dark " : L > 75 ? "Light " : "";
  if (C < 8) return L < 18 ? "Black" : L > 92 ? "White" : `${tone}grey`.replace(/^grey/, "Grey");
  let hue = HUES.find(([max]) => h < max)?.[1] ?? "red";
  if (hue === "red" && L > 70) hue = "pink";
  if ((hue === "orange" || hue === "yellow") && L < 50 && C < 45) hue = "brown";
  if (hue === "orange" && L > 70 && C < 30) hue = "beige";
  const word = `${tone}${hue}`;
  return word[0].toUpperCase() + word.slice(1);
}

/** Add a colour to a free palette and return its index. */
export function addColour(p: Palette, L: number, a: number, b: number): number {
  const lab: Lab = [L, a, b];
  p.colours.push({ code: String(p.colours.length + 1), name: describeColour(L, a, b), hex: labToHex(L, a, b), lab });
  p.lab = Float64Array.from(p.colours.flatMap((c) => c.lab));
  p.skinSafe = new Uint8Array(p.colours.length).fill(1);
  return p.colours.length - 1;
}

export function findColour(id: PaletteId, code: string): Colour | undefined {
  if (id === "free") return undefined;
  return brandPalette(id).colours.find((c) => c.code === code);
}
