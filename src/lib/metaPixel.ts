/** Custom Meta Pixel event fired when a user taps an App Store download CTA. */
export const META_PIXEL_APP_STORE_EVENT = "AppStoreClick";

declare global {
  interface Window {
    fbq?: (
      command: "trackCustom" | "track",
      eventName: string,
      params?: Record<string, string>
    ) => void;
  }
}

export function trackAppStoreClick(source: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("trackCustom", META_PIXEL_APP_STORE_EVENT, { source });
}

/**
 * Meta's standard Lead event, when the quiz's email gate saves a plan. It
 * carries nothing: no answer, email or step goes to Meta.
 */
export function trackQuizLead() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", "Lead");
}

/**
 * Meta's standard CompleteRegistration, once someone new to PrepIt signs in on
 * the website. Fired once per uid in this browser; it carries nothing.
 */
export function trackSignupRegistration(uid: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  const key = `prepit.meta.registration.${uid}`;
  try {
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, "1");
  } catch {
    // No storage: send it; Meta counts a repeat at worst.
  }

  window.fbq("track", "CompleteRegistration");
}

/**
 * Meta's standard InitiateCheckout, when the checkout paywall shows. It
 * carries nothing; the trial or purchase itself reaches Meta through
 * RevenueCat's Meta integration, with its value.
 */
export function trackCheckoutInitiated() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", "InitiateCheckout");
}
