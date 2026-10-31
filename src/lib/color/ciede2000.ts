import type { Lab } from "./lab";

const DEG = Math.PI / 180;
const POW25_7 = Math.pow(25, 7);

/**
 * CIEDE2000 colour difference (Sharma, Wu & Dalal 2005), kL = kC = kH = 1.
 * Takes plain numbers so hot loops don't allocate.
 */
export function deltaE2000(
  L1: number, a1: number, b1: number,
  L2: number, a2: number, b2: number,
): number {
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar7 = Math.pow((C1 + C2) / 2, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + POW25_7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);

  const hp = (b: number, ap: number) => {
    if (b === 0 && ap === 0) return 0;
    const h = Math.atan2(b, ap) / DEG;
    return h >= 0 ? h : h + 360;
  };
  const h1p = hp(b1, a1p);
  const h2p = hp(b2, a2p);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * DEG);

  const Lbp = (L1 + L2) / 2;
  const Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hbp /= 2;
    else hbp = h1p + h2p < 360 ? (hbp + 360) / 2 : (hbp - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos((hbp - 30) * DEG) +
    0.24 * Math.cos(2 * hbp * DEG) +
    0.32 * Math.cos((3 * hbp + 6) * DEG) -
    0.2 * Math.cos((4 * hbp - 63) * DEG);
  const dTheta = 30 * Math.exp(-Math.pow((hbp - 275) / 25, 2));
  const Cbp7 = Math.pow(Cbp, 7);
  const RC = 2 * Math.sqrt(Cbp7 / (Cbp7 + POW25_7));
  const Lm = (Lbp - 50) * (Lbp - 50);
  const SL = 1 + (0.015 * Lm) / Math.sqrt(20 + Lm);
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;
  const RT = -Math.sin(2 * dTheta * DEG) * RC;

  const l = dLp / SL;
  const c = dCp / SC;
  const h = dHp / SH;
  return Math.sqrt(l * l + c * c + h * h + RT * c * h);
}

export function deltaE2000Lab(x: Lab, y: Lab): number {
  return deltaE2000(x[0], x[1], x[2], y[0], y[1], y[2]);
}

/** Index of the palette colour (flat L,a,b triples) nearest to the given Lab. */
export function nearestIndex(L: number, a: number, b: number, palette: Float32Array | Float64Array): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0, n = palette.length / 3; i < n; i++) {
    const d = deltaE2000(L, a, b, palette[i * 3], palette[i * 3 + 1], palette[i * 3 + 2]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
