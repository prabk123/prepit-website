"use client";

import type { ReactNode } from "react";

export default function SpinningAiGlow({
  children,
  className = "",
  borderRadius = 16,
  pad = 0,
}: {
  children: ReactNode;
  className?: string;
  borderRadius?: number;
  pad?: number;
}) {
  return (
    <div className={`relative isolate ${className}`} style={{ padding: pad }}>
      <div
        aria-hidden
        className="spinning-ai-glow spinning-ai-glow--soft pointer-events-none absolute"
        style={{
          borderRadius: pad > 0 ? borderRadius + 4 : borderRadius,
          inset: pad > 0 ? Math.max(0, pad - 4) : 0,
        }}
      />
      <div
        aria-hidden
        className="spinning-ai-glow spinning-ai-glow--edge pointer-events-none absolute"
        style={{
          borderRadius: borderRadius + 1,
          inset: pad > 0 ? Math.max(0, pad - 1) : -1,
        }}
      />
      <div className="relative z-[1] overflow-hidden" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
}
