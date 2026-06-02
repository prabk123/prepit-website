"use client";

const BAD = "#FF644F";
const MID = "#FFB800";
const GOOD = "#40E300";
const NEUTRAL = "#9A9AA6";
const SEGMENT_COUNT = 10;
const SEGMENT_GAP = 1.5;

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

export default function FactorStripChart({
  component,
  baselineComponent,
  animate = false,
  delayMs = 0,
}: {
  component: number;
  baselineComponent?: number;
  animate?: boolean;
  delayMs?: number;
}) {
  const barH = 8;
  const markerX = `${component * 100}%`;

  return (
    <div className="relative h-[26px] w-full">
      <div
        className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded"
        style={{ backgroundColor: "var(--grey-10)" }}
      >
        <div className="flex h-full w-full">
          {Array.from({ length: SEGMENT_COUNT }, (_, i) => {
            const t = (i + 0.5) / SEGMENT_COUNT;
            return (
              <div
                key={i}
                className="h-full flex-1"
                style={{
                  marginRight: i < SEGMENT_COUNT - 1 ? SEGMENT_GAP : 0,
                  backgroundColor: spectrumColor(t),
                  borderRadius:
                    i === 0
                      ? "4px 0 0 4px"
                      : i === SEGMENT_COUNT - 1
                        ? "0 4px 4px 0"
                        : 0,
                  opacity: animate ? undefined : 0.85,
                  transform: animate ? "scaleX(0)" : "scaleX(1)",
                  transformOrigin: "left center",
                  animation: animate
                    ? `factorStripGrow 600ms cubic-bezier(0.33, 1, 0.68, 1) ${delayMs}ms forwards`
                    : undefined,
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        className="absolute top-0 h-0 w-0 -translate-x-1/2 border-x-[6px] border-b-[7px] border-x-transparent border-b-[var(--black-100)] transition-[left] duration-700 ease-out"
        style={{
          left: animate ? "50%" : markerX,
          animation: animate
            ? `factorMarkerSlide 800ms cubic-bezier(0.33, 1, 0.68, 1) ${delayMs + 200}ms forwards`
            : undefined,
          ...(animate ? { left: markerX } : {}),
        }}
      />

      {baselineComponent != null && (
        <div
          className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--grey-60)] opacity-70"
          style={{ left: `${baselineComponent * 100}%` }}
        />
      )}
    </div>
  );
}
