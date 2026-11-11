/**
 * Getting RevenueCat's paywall on screen sooner (PRE-464), and knowing when it
 * really is on screen.
 *
 * - `paywallFontUrls` reads the font files the paywall will load from the
 *   offering it comes with (`ui_config.app.fonts[*].web.url`), so
 *   `preloadPaywallFonts` can start them while the SDK is still fetching its
 *   paywall workflow, instead of after it mounts.
 * - `waitForPaywallDrawn` resolves once RevenueCat has mounted the paywall in
 *   the page and its fonts and icons are in, so the skeleton fades into a
 *   finished paywall, not one still swapping fonts.
 *
 * `paywallFontUrls` is pure, for `tests/paywallWarmup.test.mjs`; the rest needs a browser.
 */

/** Hosts the paywall talks to straight away, for `preconnect` on the pages that show it. */
export const PAYWALL_ORIGINS = {
  /** The SDK's API: customer info, offerings, workflows. Plain fetches, so no `crossOrigin`. */
  api: "https://api.revenuecat.com",
  /** Paywall icons and fonts (`crossOrigin`: fonts are CORS loads). */
  icons: "https://icons.pawwalls.com",
  fonts: "https://fonts.pawwalls.com",
} as const;

/**
 * The paywall fonts the SDK registers: each `ui_config` font whose web entry
 * has both a URL and a family (purchases-js 1.69 skips any other). The
 * offering's `uiConfig` isn't in purchases-js's public types, so it is read
 * defensively: anything unexpected gives none, never an error.
 */
function registeredFonts(offering: unknown): string[] {
  const fonts = (offering as { uiConfig?: { app?: { fonts?: unknown } } } | null | undefined)?.uiConfig?.app?.fonts;
  if (!fonts || typeof fonts !== "object") return [];
  const urls: string[] = [];
  for (const font of Object.values(fonts as Record<string, unknown>)) {
    const web = (font as { web?: { url?: unknown; family?: unknown } } | null)?.web;
    if (typeof web?.url === "string" && web.url && typeof web.family === "string" && web.family) urls.push(web.url);
  }
  return urls;
}

/** The https font files an offering's paywall loads, once each, for preloading. */
export function paywallFontUrls(offering: unknown): string[] {
  return [...new Set(registeredFonts(offering).filter((url) => url.startsWith("https://")))];
}

/** How many fonts the SDK adds to `document.fonts` for this paywall (one per font entry, repeats included). */
export function paywallFontCount(offering: unknown): number {
  return registeredFonts(offering).length;
}

const preloaded = new Set<string>();

/**
 * Starts downloading the paywall's fonts now. A `<link rel="preload" as="font">`
 * with `crossorigin`, the same CORS mode as the SDK's own `FontFace` load, so
 * the SDK's load is served from the browser's cache.
 */
export function preloadPaywallFonts(urls: string[]): void {
  if (typeof document === "undefined") return;
  for (const url of urls) {
    if (preloaded.has(url)) continue;
    preloaded.add(url);
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.href = url;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
}

export type PaywallDrawn = {
  /** Every paywall font was registered before the cap. */
  fonts_ready: boolean;
  /** Every image in the paywall had loaded (or failed) before the cap. */
  images_ready: boolean;
  /** Mounting took longer than 10 s (the skeleton stayed up until it did). */
  timed_out: boolean;
};

/** A mount slower than this is reported as `timed_out`. */
const MOUNT_SLOW_MS = 10_000;
const FONTS_CAP_MS = 2_500;
const IMAGES_CAP_MS = 2_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

/** Resolves true when `check` is true (polled every 50 ms), false after `capMs` or once cancelled. */
async function until(check: () => boolean, capMs: number, cancelled: () => boolean): Promise<boolean> {
  const deadline = Date.now() + capMs;
  while (!cancelled()) {
    if (check()) return true;
    if (Date.now() >= deadline) return false;
    await sleep(50);
  }
  return false;
}

/**
 * Waits for RevenueCat's paywall to be drawn in `target`: something mounted
 * with a height, then `fontCount` more fonts registered in `document.fonts`
 * than `fontsBefore` (the SDK registers each paywall font once it has loaded),
 * then the images inside it, then two frames for the paint. The mount has no
 * cap (the skeleton stays until there is a paywall to show; a paywall that
 * fails to load ends in the page's own error), but the fonts and images do,
 * so one that never arrives can't keep the skeleton up. Null when cancelled.
 */
export async function waitForPaywallDrawn(
  target: HTMLElement,
  { fontCount, fontsBefore, cancelled }: { fontCount: number; fontsBefore: number; cancelled: () => boolean },
): Promise<PaywallDrawn | null> {
  const started = Date.now();
  const mounted = await until(
    () => target.childElementCount > 0 && target.getBoundingClientRect().height > 0,
    Number.POSITIVE_INFINITY,
    cancelled,
  );
  if (!mounted || cancelled()) return null;
  const timedOut = Date.now() - started > MOUNT_SLOW_MS;
  const fontsReady =
    fontCount === 0 || (await until(() => document.fonts.size >= fontsBefore + fontCount, FONTS_CAP_MS, cancelled));
  const imagesReady = await until(
    () => [...target.querySelectorAll("img")].every((image) => image.complete),
    IMAGES_CAP_MS,
    cancelled,
  );
  await nextFrame();
  await nextFrame();
  if (cancelled()) return null;
  return { fonts_ready: fontsReady, images_ready: imagesReady, timed_out: timedOut };
}
