import type { DeviceCapture } from "@/components/device/DeviceFrame";
import type { LoopVideoProps } from "@/components/media/LoopVideo";

/**
 * Real app captures from PRE-198, in public/app. The site is dark only, so
 * these always use the app's dark-mode set at 2x.
 */
export function appCapture(name: string, alt: string): DeviceCapture {
  return {
    src: `/app/${name}-dark@2x.webp`,
    avif: `/app/${name}-dark@2x.avif`,
    webp: `/app/${name}-dark@2x.webp`,
    alt,
  };
}

/** Screen recordings are 804 x 1748, recorded in dark mode. */
export function appVideo(name: string, label: string): Omit<LoopVideoProps, "className"> {
  return {
    mp4: `/app/${name}.mp4`,
    webm: `/app/${name}.webm`,
    poster: `/app/${name}-poster.webp`,
    width: 804,
    height: 1748,
    label,
    analyticsId: name,
  };
}

/** Home Screen widget captures (not phone screens), with their pixel size at 2x. */
export function widgetCapture(name: string, alt: string, width: number, height: number) {
  return {
    src: `/app/${name}-dark@2x.webp`,
    avif: `/app/${name}-dark@2x.avif`,
    webp: `/app/${name}-dark@2x.webp`,
    alt,
    width,
    height,
  };
}
