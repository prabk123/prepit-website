import type { CSSProperties } from "react";

/**
 * Soft orange and amber light behind a phone, centred in its `relative`
 * parent. Pass `style` (left, top, width) to move it.
 */
export default function Glow({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={style}
      className={`glow-warm absolute left-1/2 top-1/2 -z-10 aspect-square w-[130%] max-w-[720px] -translate-x-1/2 -translate-y-1/2 ${className ?? ""}`}
    />
  );
}
