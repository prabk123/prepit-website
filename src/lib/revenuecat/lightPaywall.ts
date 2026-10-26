/**
 * The website is always light, but RevenueCat's paywall picks its light or
 * dark colours from the browser's `prefers-color-scheme` (purchases-js reads
 * `window.matchMedia("(prefers-color-scheme: dark)")` and has no option to set
 * it). On a Mac in dark mode that put the dark paywall inside the light page
 * (PRE-375). The paywall is the iPhone app's too, so its dark colours can't
 * simply be changed in RevenueCat. While the paywall is on screen, a dark
 * colour-scheme query from script answers "no"; CSS media queries and every
 * other `matchMedia` query are untouched. If purchases-js ever stops asking
 * this way, the paywall just follows the system again.
 */

/** Whether a media query asks if the visitor prefers dark colours. */
export function isDarkSchemeQuery(query: string): boolean {
  return /prefers-color-scheme\s*:\s*dark/i.test(query);
}

/** A query list that never matches and never changes. */
function neverMatches(media: string): MediaQueryList {
  const noop = () => {};
  return {
    matches: false,
    media,
    onchange: null,
    addEventListener: noop,
    removeEventListener: noop,
    addListener: noop,
    removeListener: noop,
    dispatchEvent: () => false,
  } as MediaQueryList;
}

let holders = 0;
let original: typeof window.matchMedia | null = null;

/**
 * Shows RevenueCat's paywall in its light colours until the returned function
 * is called. Safe to nest (a second paywall showing while the first unmounts).
 */
export function forceLightPaywall(): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  if (holders === 0) {
    const real = window.matchMedia;
    original = real;
    window.matchMedia = (query: string) => (isDarkSchemeQuery(query) ? neverMatches(query) : real.call(window, query));
  }
  holders += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders -= 1;
    if (holders === 0 && original) {
      window.matchMedia = original;
      original = null;
    }
  };
}

/** Whether the visitor's system is in dark mode (so the light paywall was forced), for analytics. */
export function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return (original ?? window.matchMedia).call(window, "(prefers-color-scheme: dark)").matches;
}
