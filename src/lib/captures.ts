import type { DeviceCapture } from "@/components/device/DeviceFrame";
import type { LoopVideoProps } from "@/components/media/LoopVideo";

/** `1x, 2x` sources for a dark-mode capture, so 1x screens get the smaller file. */
function darkSrcSet(name: string, ext: "avif" | "webp") {
  return `/app/${name}-dark@1x.${ext} 1x, /app/${name}-dark@2x.${ext} 2x`;
}

/**
 * Real app captures from PRE-198, in public/app. The site is dark only, so
 * these always use the app's dark-mode set, at 1x or 2x by screen density.
 */
export function appCapture(name: string, alt: string): DeviceCapture {
  return {
    src: `/app/${name}-dark@2x.webp`,
    avif: darkSrcSet(name, "avif"),
    webp: darkSrcSet(name, "webp"),
    alt,
  };
}

/**
 * Recordings whose WebM came out larger than the MP4. They are served as MP4
 * only, since every browser that plays WebM also plays MP4.
 */
const MP4_ONLY = new Set(["03-log-typed", "08-chat-ask", "12-plan-week", "21-walkthrough"]);

/** Screen recordings are 804 x 1748, recorded in dark mode. */
export function appVideo(name: string, label: string): Omit<LoopVideoProps, "className"> {
  return {
    mp4: `/app/${name}.mp4`,
    webm: MP4_ONLY.has(name) ? undefined : `/app/${name}.webm`,
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
    avif: darkSrcSet(name, "avif"),
    webp: darkSrcSet(name, "webp"),
    alt,
    width,
    height,
  };
}
