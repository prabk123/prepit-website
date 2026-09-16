"use client";

import type { ReactNode } from "react";

export default function SpinningAiGlow({
  children,
  className = "",
  borderRadius = 16,
}: {
  children: ReactNode;
  className?: string;
  borderRadius?: number;
}) {
  return (
    <div className={`relative isolate ${className}`}>
      <div
        aria-hidden
        className="spinning-ai-glow spinning-ai-glow--soft pointer-events-none absolute inset-0"
        style={{ borderRadius }}
      />
      <div
        aria-hidden
        className="spinning-ai-glow spinning-ai-glow--edge pointer-events-none absolute -inset-px"
        style={{ borderRadius: borderRadius + 1 }}
      />
      <div className="relative z-[1]" style={{ borderRadius }}>
        {children}
      </div>
    </div>
  );
}
