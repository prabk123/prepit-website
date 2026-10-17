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
  "06c-signal-mood",
  "07-food-analysis",
  "10-voice-note",
  "11-check-in-report",
  "13-grocery-list",
  "14-weekly-pattern",
  "16-supplements-card",
  // Suggested for you, populated from a plant-only log (PRE-285).
  "16c-supplements-suggested",
  "17-achievement",
  "18-offline-water",
  "19-body-composition",
  "20-focus-picker",
  // From the app's Tips and tricks guides (fresca_app assets/tips/steps).
  "22-action-button-siri",
  "23-home-screen-widgets",
  // A clean Home Screen (not in edit mode) with the Today's calories widget, for the widgets page.
  "23b-home-screen-widgets",
  // Also from Tips and tricks: Log a meal on the Action button, the Lock Screen and in Control Centre (PRE-285).
  "26-action-button-shortcut",
  "26b-lock-screen-control",
  "26c-control-centre",
  // Tips and tricks again: the first plan question with its day picker, and swap ideas for a meal (PRE-288).
  "27-plan-questions",
  "27b-plan-swap",
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

/** `1x, 2x` sources for a capture, so 1x screens get the smaller file. */
function srcSet(name: string, ext: "avif" | "webp", mode: CaptureMode) {
  return `/app/${name}-${mode}@1x.${ext} 1x, /app/${name}-${mode}@2x.${ext} 2x`;
}

/**
 * Stills with a card thumbnail: the telling part of the screen, cropped by
 * scripts/make-card-thumbs.py to 804 x 500 at 2x (PRE-289).
 */
export const CARD_THUMBS = [
  "01-home",
  "01b-home-log",
  "02-chat-chart",
  "05-meal-detail",
  "05b-meal-detail-scrolled",
  "06-signal-energy",
  "11-check-in-report",
  "13-grocery-list",
  "22-action-button-siri",
  // Not 23-home-screen-widgets: it is in edit mode, with a remove badge on the widget's corner.
  "23b-home-screen-widgets",
] as const;

export type CardThumb = (typeof CARD_THUMBS)[number];

export function isCardThumb(name: string): name is CardThumb {
  return (CARD_THUMBS as readonly string[]).includes(name);
}

/** A card thumbnail's `1x, 2x` sources. */
export function cardThumb(name: CardThumb) {
  const set = (ext: string) => `/app/thumbs/${name}@1x.${ext} 1x, /app/thumbs/${name}@2x.${ext} 2x`;
  return { avif: set("avif"), webp: set("webp"), src: `/app/thumbs/${name}@2x.webp` };
}

/**
 * Real app captures from PRE-198, in public/app, at 1x or 2x by screen
 * density. The site is light-led, so these use the app's light-mode set
 * unless a dark band asks for `dark`.
 */
export function appCapture(name: string, alt: string, mode: CaptureMode = "light"): DeviceCapture {
  return {
    src: `/app/${name}-${mode}@2x.webp`,
    avif: srcSet(name, "avif", mode),
    webp: srcSet(name, "webp", mode),
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

/**
 * Crops of a chat capture: one message and its replies without the phone
 * around it, at their 2x pixel size (scripts/process-app-captures.py CROPS).
 */
export const CHAT_CROPS = {
  "25-nudge-missed-breakfast-crop": { width: 804, height: 676 },
  "25b-nudge-protein-crop": { width: 804, height: 1076 },
  // Stops inside its Weekly calorie pattern card; ChatCapture fades it out.
  "24-nudge-weekly-pattern-crop": { width: 804, height: 1069 },
  "24b-nudge-weigh-in-crop": { width: 804, height: 669 },
} as const;

export function chatCrop(name: keyof typeof CHAT_CROPS, alt: string) {
  return {
    src: `/app/${name}-light@2x.webp`,
    avif: srcSet(name, "avif", "light"),
    webp: srcSet(name, "webp", "light"),
    alt,
    ...CHAT_CROPS[name],
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

/**
 * Parts of a chat still cut out with their rounded corners
 * (scripts/process-app-captures.py CUTOUTS), lifted over the phone on the
 * homepage (PRE-294). `box` is where the part sits on the 1206 x 2622
 * capture, so it can be laid exactly over the screen.
 */
export const CHAT_CUTOUTS = {
  "25b-nudge-protein-bubble": [48, 930, 1037, 1746],
  "25b-nudge-protein-reply": [48, 1794, 1158, 1938],
  "24b-nudge-weigh-in-bubble": [48, 1536, 1037, 1920],
  "24b-nudge-weigh-in-reply": [48, 1968, 1158, 2112],
} as const;

export type ChatCutout = ReturnType<typeof chatCutout>;

export function chatCutout(name: keyof typeof CHAT_CUTOUTS) {
  const [left, top, right, bottom] = CHAT_CUTOUTS[name];
  return {
    src: `/app/${name}-light@2x.webp`,
    avif: srcSet(name, "avif", "light"),
    webp: srcSet(name, "webp", "light"),
    width: Math.round(((right - left) * 2) / 3),
    height: Math.round(((bottom - top) * 2) / 3),
    /** Position on the screen, as percentages of its width and height. */
    left: (left / 1206) * 100,
    top: (top / 2622) * 100,
    widthPercent: ((right - left) / 1206) * 100,
  };
}
