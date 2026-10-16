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

/** The app's light or dark capture set. Light pages use light; dark bands may use dark. */
export type CaptureMode = "light" | "dark";

/**
 * Stills that only exist in dark mode: the clean Home Screen was captured on
 * a dark wallpaper only. They show dark wherever they are used.
 */
const DARK_ONLY = new Set<string>(["23b-home-screen-widgets"]);

function modeFor(name: string, mode: CaptureMode): CaptureMode {
  return DARK_ONLY.has(name) ? "dark" : mode;
}

/** `1x, 2x` sources for a capture, so 1x screens get the smaller file. */
function srcSet(name: string, ext: "avif" | "webp", mode: CaptureMode) {
  const m = modeFor(name, mode);
  return `/app/${name}-${m}@1x.${ext} 1x, /app/${name}-${m}@2x.${ext} 2x`;
}

/** The 1x files of a still, for small card thumbnails. */
export function captureThumb(name: string, mode: CaptureMode = "light") {
  const m = modeFor(name, mode);
  return { avif: `/app/${name}-${m}@1x.avif`, webp: `/app/${name}-${m}@1x.webp` };
}

/**
 * Real app captures from PRE-198, in public/app, at 1x or 2x by screen
 * density. The site is light-led, so these use the app's light-mode set
 * unless a dark band asks for `dark`.
 */
export function appCapture(name: string, alt: string, mode: CaptureMode = "light"): DeviceCapture {
  return {
    src: `/app/${name}-${modeFor(name, mode)}@2x.webp`,
    avif: srcSet(name, "avif", mode),
    webp: srcSet(name, "webp", mode),
    alt,
  };
}

/**
 * Recordings whose WebM came out larger than the MP4. They are served as MP4
 * only, since every browser that plays WebM also plays MP4.
 */
const MP4_ONLY = new Set(["03-log-typed", "08-chat-ask", "12-plan-week", "21-walkthrough"]);

/**
 * Screen recordings are 804 x 1748. They were recorded in dark mode only
 * (there are no light recordings yet), so they show the dark app.
 */
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
export function widgetCapture(name: string, alt: string, width: number, height: number, mode: CaptureMode = "light") {
  return {
    src: `/app/${name}-${mode}@2x.webp`,
    avif: srcSet(name, "avif", mode),
    webp: srcSet(name, "webp", mode),
    alt,
    width,
    height,
  };
}

/** A widget render, without a phone around it. */
export function appWidget(name: AppWidget, mode: CaptureMode = "light") {
  return {
    avif: `/app/${name}-${mode}@2x.avif`,
    webp: `/app/${name}-${mode}@2x.webp`,
    ...APP_WIDGETS[name],
  };
}
