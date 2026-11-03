import LoopVideo, { LoopVideoToggle, LoopVideoToggleScope, type LoopVideoProps } from "@/components/media/LoopVideo";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH, type DeviceCapture } from "@/components/device/DeviceFrame";

/**
 * A real app capture as a lifted card on the cream page (PRE-457): the
 * screen itself with rounded corners and Landing v9's warm shadow, in place
 * of the metal phone frame. Takes the same still or clip as DeviceFrame
 * (lib/captures appCapture and appVideo). A clip's pause button sits under
 * the card, clear of the app's own controls, as under DeviceFrame.
 */
export default function ScreenCard({
  capture,
  video,
  priority,
  className,
}: {
  capture?: DeviceCapture;
  video?: Omit<LoopVideoProps, "className">;
  /** Load the still, or the clip's poster, eagerly (above the fold). */
  priority?: boolean;
  /** Width classes, e.g. `w-[min(100%,300px)]`. */
  className?: string;
}) {
  const card = (
    <div className={className}>
      <div className="overflow-hidden rounded-[28px] bg-white shadow-[var(--shadow-v9-card)] ring-1 ring-black/5">
        {capture && (
          <picture>
            {capture.avif && <source srcSet={capture.avif} type="image/avif" />}
            {capture.webp && <source srcSet={capture.webp} type="image/webp" />}
            <img
              src={capture.src}
              alt={capture.alt}
              width={CAPTURE_WIDTH}
              height={CAPTURE_HEIGHT}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
              decoding="async"
              className="block h-auto w-full"
            />
          </picture>
        )}
        {video && <LoopVideo {...video} priority={priority} />}
      </div>
      {video && <LoopVideoToggle />}
    </div>
  );
  return video ? <LoopVideoToggleScope>{card}</LoopVideoToggleScope> : card;
}
