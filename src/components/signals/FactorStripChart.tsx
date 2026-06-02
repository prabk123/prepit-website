"use client";

import { spectrumColor } from "@/components/signals/factorStripUtils";

export { signedLabel, valueColorForComponent } from "@/components/signals/factorStripUtils";

const SEGMENT_COUNT = 10;
const SEGMENT_GAP = 1.5;

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
