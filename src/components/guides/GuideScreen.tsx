import ScreenCard from "@/components/features/ScreenCard";
import type { DeviceCapture } from "@/components/device/DeviceFrame";
import LoopVideo, { LoopVideoToggle, LoopVideoToggleScope, type LoopVideoProps } from "@/components/media/LoopVideo";

/**
 * A guide's app capture, a still or a screen recording, on the shared
 * ScreenCard the feature pages use (PRE-457; it was a phone frame). A clip's
 * pause button sits under the card, clear of the app's own controls, as it
 * does under DeviceFrame.
 */
export default function GuideScreen({
  capture,
  video,
  width = "fill",
  priority,
}: {
  capture?: DeviceCapture;
  video?: Omit<LoopVideoProps, "className">;
  width?: number | "fill";
  priority?: boolean;
}) {
  if (video) {
    return (
      <LoopVideoToggleScope>
        {/* The wrapper takes the card's width, so the pause button lines up with the card's right edge. */}
        <div className="mx-auto" style={{ width: width === "fill" ? "100%" : `min(${width}px, 78%)` }}>
          <ScreenCard ring width="fill">
            <LoopVideo {...video} priority={priority} />
          </ScreenCard>
          <LoopVideoToggle />
        </div>
      </LoopVideoToggleScope>
    );
  }
  if (!capture) return null;
  return <ScreenCard ring width={width} capture={capture} priority={priority} />;
}
