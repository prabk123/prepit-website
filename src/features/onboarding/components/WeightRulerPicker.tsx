"use client";

import { useEffect, useRef } from "react";

const STEP = 0.1;
const ITEM_WIDTH = 16;

export default function WeightRulerPicker({
  value,
  min,
  max,
  unit,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const skippingRef = useRef(false);
  const count = Math.round((max - min) / STEP) + 1;

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const index = Math.round((value - min) / STEP);
    const left = index * ITEM_WIDTH;
    if (Math.abs(node.scrollLeft - left) > 1) {
      skippingRef.current = true;
      node.scrollLeft = left;
      requestAnimationFrame(() => {
        skippingRef.current = false;
      });
    }
  }, [min, value]);

  function emitFromScroll() {
    const node = scrollerRef.current;
    if (!node || skippingRef.current) return;
    const index = Math.round(node.scrollLeft / ITEM_WIDTH);
    const next = Number((min + index * STEP).toFixed(1));
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped !== value) onChange(clamped);
  }

  function snap() {
    const node = scrollerRef.current;
    if (!node) return;
    const index = Math.round(node.scrollLeft / ITEM_WIDTH);
    node.scrollTo({ left: index * ITEM_WIDTH, behavior: "smooth" });
    emitFromScroll();
  }

  return (
    <div className="relative h-20 w-full">
      <div
        ref={scrollerRef}
        onScroll={emitFromScroll}
        onTouchEnd={snap}
        onMouseUp={snap}
        className="h-full overflow-x-auto overflow-y-hidden"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex h-full items-start pt-2" style={{ paddingLeft: "50%", paddingRight: "50%" }}>
          {Array.from({ length: count }, (_, index) => {
            const tick = Number((min + index * STEP).toFixed(1));
            const major = index % 10 === 0;
            return (
              <div
                key={tick}
                className="relative flex shrink-0 snap-center flex-col items-center"
                style={{ width: ITEM_WIDTH }}
              >
                <div
                  className={`rounded-full ${
                    major ? "h-6 w-1 bg-[var(--text-secondary)]" : "h-4 w-px bg-[var(--text-tertiary)]"
                  }`}
                />
                {major ? (
                  <span className="absolute top-8 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                    {tick.toFixed(0)}
                    {unit}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-[var(--primary)]" />
    </div>
  );
}
