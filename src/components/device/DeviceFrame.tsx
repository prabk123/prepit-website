import type { CSSProperties, ReactNode } from "react";
import LoopVideo, { type LoopVideoProps } from "@/components/media/LoopVideo";

/** Full-resolution iPhone 17 Pro capture size. */
export const CAPTURE_WIDTH = 1206;
export const CAPTURE_HEIGHT = 2622;

export const DEVICE_MIN_WIDTH = 260;
export const DEVICE_MAX_WIDTH = 420;

export type CaptureSources = {
  avif?: string;
  webp?: string;
  /** Fallback for browsers without AVIF or WebP picture support. */
  src: string;
};

/** A real app capture. The site is dark only, so use the app's dark-mode captures. */
export type DeviceCapture = CaptureSources & { alt: string };

type DeviceFrameProps = {
  /**
   * Frame width in px, clamped to 260 to 420. Leave it unset to size the frame
   * with classes instead, for example `[--device-w:280px] lg:[--device-w:400px]`
   * (default 320 px).
   */
  width?: number;
  /** Rotation in degrees, for paired or hero layouts. */
  tilt?: number;
  /** A still screen capture. */
  capture?: DeviceCapture;
  /** A looping screen recording, played only in view. */
  video?: Omit<LoopVideoProps, "className">;
  /** Load the capture eagerly (above the fold). */
  priority?: boolean;
  className?: string;
  children?: ReactNode;
};

function clampWidth(width: number) {
  return Math.min(DEVICE_MAX_WIDTH, Math.max(DEVICE_MIN_WIDTH, width));
}

function CapturePicture({
  capture,
  priority,
}: {
  capture: DeviceCapture;
  priority?: boolean;
}) {
  return (
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
      />
    </picture>
  );
}

/**
 * An iPhone 17 Pro frame drawn in CSS, holding a still capture, a looping
 * video, or custom children.
 */
export default function DeviceFrame({
  width,
  tilt,
  capture,
  video,
  priority,
  className,
  children,
}: DeviceFrameProps) {
  const style = {
    ...(width ? { "--device-w": `${clampWidth(width)}px` } : {}),
    ...(tilt ? { "--device-tilt": `${tilt}deg` } : {}),
  } as CSSProperties;

  return (
    <div className={`device-frame ${className ?? ""}`} style={style}>
      <div className="device-frame__shell">
        <span aria-hidden className="device-frame__button device-frame__button--action" />
        <span aria-hidden className="device-frame__button device-frame__button--volume-up" />
        <span aria-hidden className="device-frame__button device-frame__button--volume-down" />
        <span aria-hidden className="device-frame__button device-frame__button--side" />
        <span aria-hidden className="device-frame__button device-frame__button--camera" />
        <div className="device-frame__bezel">
          <div className="device-frame__screen">
            {capture && (
              <CapturePicture capture={capture} priority={priority} />
            )}
            {video && <LoopVideo {...video} />}
            {children}
            <span aria-hidden className="device-frame__island" />
          </div>
        </div>
      </div>
    </div>
  );
}
