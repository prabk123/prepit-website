"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import SpinningAiGlow from "@/features/onboarding/components/SpinningAiGlow";

export const PHONE_FRAME_WIDTH = 300;
export const PHONE_BORDER = 6;
export const PHONE_INNER_WIDTH = 288;
export const PHONE_INNER_HEIGHT = Math.round(PHONE_INNER_WIDTH * (844 / 390));
export const PHONE_FRAME_HEIGHT = PHONE_INNER_HEIGHT + PHONE_BORDER * 2;
export const FRAME_PAD = 16;

type ZoomOrigin = "bottom" | "center" | "top";

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-[40px] border-[6px] border-black bg-[var(--scaffold)] shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
      style={{
        width: PHONE_FRAME_WIDTH,
        height: PHONE_FRAME_HEIGHT,
      }}
    >
      <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black" />
      <div
        className="relative overflow-hidden bg-[var(--scaffold)]"
        style={{ height: PHONE_INNER_HEIGHT }}
      >
        {children}
      </div>
    </div>
  );
}

export default function PhoneDemoViewport({
  children,
  zoom = 1,
  zoomOrigin = "center",
  alignY,
  zoomDurationMs = 650,
  glow = true,
}: {
  children: ReactNode;
  zoom?: number;
  zoomOrigin?: ZoomOrigin;
  /** -1 pins the top, 0 the center, 1 the bottom. Animates when changed. */
  alignY?: number;
  zoomDurationMs?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const outerW = PHONE_FRAME_WIDTH + FRAME_PAD * 2;
  const outerH = PHONE_FRAME_HEIGHT + FRAME_PAD * 2;
  const contain =
    size.w > 0 && size.h > 0
      ? Math.min(1, size.w / outerW, size.h / outerH)
      : 0;
  const fittedW = outerW * contain;
  const maxZoom = fittedW > 0 ? size.w / fittedW : 1;
  const camera = Math.min(Math.max(zoom, 1), Math.max(maxZoom, 1));
  const resolvedAlignY =
    alignY ??
    (zoomOrigin === "bottom" ? 1 : zoomOrigin === "top" ? -1 : 0);
  const panY = -resolvedAlignY * (camera - 1) * 50;

  return (
    <div ref={ref} className="relative h-full w-full min-h-0 overflow-hidden">
      {contain > 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="will-change-transform"
            style={{
              width: fittedW,
              height: outerH * contain,
              transform: `translateY(${panY}%) scale(${camera})`,
              transformOrigin: "50% 50%",
              transition: `transform ${zoomDurationMs}ms cubic-bezier(0.33, 1, 0.68, 1)`,
            }}
          >
            <div
              style={{
                width: outerW,
                height: outerH,
                transform: `scale(${contain})`,
                transformOrigin: "top left",
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: outerW, height: outerH, padding: FRAME_PAD }}
              >
                {glow ? (
                  <SpinningAiGlow borderRadius={40}>
                    <PhoneFrame>{children}</PhoneFrame>
                  </SpinningAiGlow>
                ) : (
                  <PhoneFrame>{children}</PhoneFrame>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
