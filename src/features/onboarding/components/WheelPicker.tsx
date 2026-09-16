"use client";

import { useEffect, useRef } from "react";

const ITEM_HEIGHT = 32;
const VISIBLE = 5;

export default function WheelPicker({
  value,
  values,
  format,
  onChange,
  width,
}: {
  value: number;
  values: number[];
  format?: (value: number) => string;
  onChange: (value: number) => void;
  width?: number;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const skippingRef = useRef(false);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const index = Math.max(0, values.indexOf(value));
    const top = index * ITEM_HEIGHT;
    if (Math.abs(node.scrollTop - top) > 1) {
      skippingRef.current = true;
      node.scrollTop = top;
      requestAnimationFrame(() => {
        skippingRef.current = false;
      });
    }
  }, [value, values]);

  function handleScroll() {
    const node = scrollerRef.current;
    if (!node || skippingRef.current) return;
    const index = Math.round(node.scrollTop / ITEM_HEIGHT);
    const next = values[Math.max(0, Math.min(values.length - 1, index))];
    if (next !== undefined && next !== value) onChange(next);
  }

  function handleScrollEnd() {
    const node = scrollerRef.current;
    if (!node) return;
    const index = Math.round(node.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(values.length - 1, index));
    node.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
    const next = values[clamped];
    if (next !== undefined && next !== value) onChange(next);
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{ width: width ?? "100%", height: ITEM_HEIGHT * VISIBLE }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-8 -translate-y-1/2 rounded-lg bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
        aria-hidden
      />
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        onTouchEnd={handleScrollEnd}
        onMouseUp={handleScrollEnd}
        className="wheel-picker-mask h-full overflow-y-auto overscroll-contain"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ height: ITEM_HEIGHT * 2 }} />
        {values.map((item) => (
          <div
            key={item}
            className={`flex h-8 snap-center items-center justify-center text-base ${
              item === value ? "font-medium text-[var(--text-primary)]" : "font-normal text-[var(--text-secondary)]"
            }`}
          >
            {format ? format(item) : item}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * 2 }} />
      </div>
    </div>
  );
}
