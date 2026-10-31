import dmcData from "@/data/dmc.json";
import { hexToLab, type Lab } from "@/lib/color/lab";

export type Floss = { code: string; name: string; hex: string };
export type FlossLab = Floss & { lab: Lab };

export const DMC: readonly FlossLab[] = (dmcData.colors as Floss[]).map((c) => ({ ...c, lab: hexToLab(c.hex) }));

/** All DMC Lab values as flat triples, for fast nearest-colour searches. */
export const DMC_LAB: Float64Array = Float64Array.from(DMC.flatMap((c) => c.lab));
