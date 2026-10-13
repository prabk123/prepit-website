import type { DeviceCapture } from "@/components/device/DeviceFrame";
import type { LoopVideoProps } from "@/components/media/LoopVideo";

/**
 * Real simulator captures from PRE-198, served from `public/app`. The site is
 * dark only, so stills use the dark @2x set.
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

const CLIP_WIDTH = 804;
const CLIP_HEIGHT = 1748;

export function isAppStill(name: string): name is AppStill {
  return (APP_STILLS as readonly string[]).includes(name);
}

export function isAppClip(name: string): name is AppClip {
  return (APP_CLIPS as readonly string[]).includes(name);
}

export function isAppWidget(name: string): name is AppWidget {
  return name in APP_WIDGETS;
}

/** A still for `<DeviceFrame capture>`. */
export function appCapture(name: AppStill, alt: string): DeviceCapture {
  return {
    src: `/app/${name}-dark@2x.webp`,
    avif: `/app/${name}-dark@2x.avif`,
    webp: `/app/${name}-dark@2x.webp`,
    alt,
  };
}

/** A screen recording for `<DeviceFrame video>`. */
export function appClip(name: AppClip, label: string): Omit<LoopVideoProps, "className"> {
  return {
    mp4: `/app/${name}.mp4`,
    webm: `/app/${name}.webm`,
    poster: `/app/${name}-poster.webp`,
    width: CLIP_WIDTH,
    height: CLIP_HEIGHT,
    label,
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
