import type { DeviceCapture } from "@/components/device/DeviceFrame";
import type { LoopVideoProps } from "@/components/media/LoopVideo";

/**
 * The names guide MDX may use, so an unknown capture fails the build. Pages
 * pass names straight to the helpers below.
 */
export const APP_STILLS = [
  "01-home",
  "01b-home-log",
  "01c-home-scrolled",
  "02-chat-chart",
  "05-meal-detail",
  "05b-meal-detail-scrolled",
  "06-signal-energy",
  "06b-signal-satiety",
  "07-food-analysis",
  "10-voice-note",
  "11-check-in-report",
  "13-grocery-list",
  "14-weekly-pattern",
  "16-supplements-card",
  "16b-supplements-screen",
  "17-achievement",
  "18-offline-water",
  "19-body-composition",
  "20-focus-picker",
  // From the app's Tips and tricks guides (fresca_app assets/tips/steps).
  "22-action-button-siri",
  "23-home-screen-widgets",
  // A clean Home Screen (not in edit mode) with the Today's calories widget, for the widgets page.
  "23b-home-screen-widgets",
] as const;

export const APP_CLIPS = [
  "03-log-typed",
  "04-log-photo",
  "08-chat-ask",
  "09-chat-log-it",
  "12-plan-week",
  "21-walkthrough",
] as const;

export const APP_WIDGETS = {
  "15-widget-signals-small": { width: 474, height: 474 },
  "15-widget-signals-medium": { width: 1014, height: 474 },
  "15-widget-streak-small": { width: 474, height: 474 },
  "15-widget-today-plan-large": { width: 1014, height: 1062 },
  "15-widget-water-small": { width: 474, height: 474 },
  "15-widget-water-medium": { width: 1014, height: 474 },
} as const;

export type AppStill = (typeof APP_STILLS)[number];
export type AppClip = (typeof APP_CLIPS)[number];
export type AppWidget = keyof typeof APP_WIDGETS;

export function isAppStill(name: string): name is AppStill {
  return (APP_STILLS as readonly string[]).includes(name);
}

export function isAppClip(name: string): name is AppClip {
  return (APP_CLIPS as readonly string[]).includes(name);
}

export function isAppWidget(name: string): name is AppWidget {
  return name in APP_WIDGETS;
}

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
const MP4_ONLY = new Set(["08-chat-ask", "09-chat-log-it", "21-walkthrough"]);

/** Screen recordings are 804 x 1748, recorded in light mode (PRE-281). */
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

/** A widget render, without a phone around it. */
export function appWidget(name: AppWidget) {
  return {
    avif: `/app/${name}-dark@2x.avif`,
    webp: `/app/${name}-dark@2x.webp`,
    ...APP_WIDGETS[name],
  };
}
