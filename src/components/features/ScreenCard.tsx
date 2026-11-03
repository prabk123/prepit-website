import type { ReactNode } from "react";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH, type DeviceCapture } from "@/components/device/DeviceFrame";

type ScreenCardProps = {
  /**
   * Largest width in px, and the card also stays within 78% of its column
   * (default 300). `"fill"` takes the whole column, for a card in a grid cell.
   */
  width?: number | "fill";
  /** A hairline ring around the card, for screens whose edge meets a light page. */
  ring?: boolean;
  /** Load with the page instead of lazily (a card in the first screen). */
  priority?: boolean;
  className?: string;
} & ({ capture: DeviceCapture; children?: never } | { capture?: never; children: ReactNode });

/**
 * A whole app screen as a card on the page, without a phone around it (the
 * site pages handoff's `.screen-card`): rounded corners and the v9 card
 * shadow, centred in its column. Pass a `capture` from `appCapture` (phones
 * get the 1x file, retina screens the 2x) or your own `children`.
 */
export default function ScreenCard({ capture, children, width = 300, ring, priority, className }: ScreenCardProps) {
  return (
    <div
      className={`mx-auto overflow-hidden rounded-[30px] bg-surface shadow-[var(--shadow-v9-card)] ${ring ? "ring-1 ring-black/5" : ""} ${className ?? ""}`}
      style={{ width: width === "fill" ? "100%" : `min(${width}px, 78%)` }}
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
            loading={priority ? "eager" : "lazy"}
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
