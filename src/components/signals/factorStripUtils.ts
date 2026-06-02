const BAD = "#FF644F";
const MID = "#FFB800";
const GOOD = "#40E300";
const NEUTRAL = "#9A9AA6";

function spectrumColor(t: number): string {
  const x = Math.max(0, Math.min(1, t));
  const badToMidEnd = 0.2;
  const neutralArrivesAt = 0.44;

  const lerp = (a: string, bHex: string, f: number) => {
    const parse = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
    };
    const [r1, g1, b1] = parse(a);
    const [r2, g2, b2] = parse(bHex);
    const r = Math.round(r1 + (r2 - r1) * f);
    const g = Math.round(g1 + (g2 - g1) * f);
    const b = Math.round(b1 + (b2 - b1) * f);
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (x <= badToMidEnd) return lerp(BAD, MID, x / badToMidEnd);
  if (x <= neutralArrivesAt) {
    return lerp(MID, NEUTRAL, (x - badToMidEnd) / (neutralArrivesAt - badToMidEnd));
  }
  const u = (x - neutralArrivesAt) / (1 - neutralArrivesAt);
  const mutedGreen = lerp(NEUTRAL, GOOD, 0.38);
  if (u <= 0.48) return lerp(NEUTRAL, mutedGreen, u / 0.48);
  return lerp(mutedGreen, GOOD, (u - 0.48) / 0.52);
}

export function valueColorForComponent(component: number): string {
  return spectrumColor(component);
}

export function signedLabel(tilt: number): string {
  const rounded = Math.round(tilt * 10) / 10;
  if (Math.abs(rounded) < 0.05) return "0";
  if (rounded === Math.round(rounded)) {
    return rounded > 0 ? `+${Math.round(rounded)}` : `${Math.round(rounded)}`;
  }
  const t = rounded.toFixed(1);
  return rounded > 0 ? `+${t}` : t;
}

export { spectrumColor };
