import type { DeviceCapture } from "@/components/device/DeviceFrame";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH } from "@/components/device/DeviceFrame";

/**
 * A whole app screen as a card on the page, without a phone around it
 * (PRE-453, the handoff's `.screen-card`): rounded corners and the v9 card
 * shadow, at most 300 px wide and centred in its column. Use `appCapture`
 * for the sources, so phones get the 1x file and retina screens the 2x.
 */
export default function ScreenCard({ capture, className }: { capture: DeviceCapture; className?: string }) {
  return (
    <div
      className={`mx-auto w-[min(300px,78%)] overflow-hidden rounded-[30px] bg-surface shadow-[var(--shadow-v9-card)] ${className ?? ""}`}
    >
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
    </div>
  );
}
