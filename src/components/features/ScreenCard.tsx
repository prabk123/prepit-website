import type { ReactNode } from "react";
import type { DeviceCapture } from "@/components/device/DeviceFrame";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH } from "@/components/device/DeviceFrame";

type ScreenCardProps = {
  /** A whole app screen from `appCapture`, so phones get the 1x file and retina screens the 2x. */
  capture?: DeviceCapture;
  /** Anything else drawn as a card (a widget render, a crop). Used when there is no `capture`. */
  children?: ReactNode;
  /**
   * Widest the card gets, in px (default 300, the handoff's screen card).
   * Below that it takes 78% of its column; `"full"` fills the column instead.
   */
  width?: number | "full";
  className?: string;
};

/**
 * A real app screen as a card on the page, without a phone around it
 * (PRE-453, the handoff's `.screen-card`): rounded corners and the v9 card
 * shadow, centred in its column. Shared by the feature pages, so every
 * screen card on the site looks the same.
 */
export default function ScreenCard({ capture, children, width = 300, className }: ScreenCardProps) {
  const size = width === "full" ? "100%" : `min(${width}px, 78%)`;
  return (
    <div
      className={`mx-auto overflow-hidden rounded-[30px] bg-surface shadow-[var(--shadow-v9-card)] ${className ?? ""}`}
      style={{ width: size }}
    >
      {capture ? (
        <picture>
          {capture.avif && <source srcSet={capture.avif} type="image/avif" />}
          {capture.webp && <source srcSet={capture.webp} type="image/webp" />}
          <img
            src={capture.src}
            alt={capture.alt}
            width={CAPTURE_WIDTH}
            height={CAPTURE_HEIGHT}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </picture>
      ) : (
        children
      )}
    </div>
  );
}
