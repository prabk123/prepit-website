/** Custom Meta Pixel event fired when a user taps an App Store download CTA. */
export const META_PIXEL_APP_STORE_EVENT = "AppStoreClick";

declare global {
  interface Window {
    fbq?: (
      command: "trackCustom" | "track" | "init",
      eventNameOrPixelId: string,
      params?: Record<string, string | number | string[]>
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
 * Manual advanced matching once someone has signed in: re-initialising the
 * pixel with their email and Firebase uid (the RevenueCat app user id) adds
 * them, hashed by the pixel in the browser, to every later event on the page.
 * Only identity, never answers. Needs the pixel already loaded, so it follows
 * the pixel's own consent rule.
 */
export function identifyPixelUser(uid: string, email: string | null) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!pixelId || typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  const userData: Record<string, string> = { external_id: uid };
  const em = email?.trim().toLowerCase();
  if (em && em.includes("@")) userData.em = em;

  window.fbq("init", pixelId, userData);
}

/**
 * Meta's standard InitiateCheckout, when the checkout paywall shows, with the
 * price of the plan the visitor came for so Meta can optimise on value. Only
 * the plan and its price, nothing about the person.
 */
export function trackCheckoutInitiated(checkout: { value: number; currency: string; plan: string } | null) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  if (!checkout) {
    window.fbq("track", "InitiateCheckout");
    return;
  }
  window.fbq("track", "InitiateCheckout", {
    value: checkout.value,
    currency: checkout.currency,
    content_ids: [checkout.plan],
    content_type: "product",
    num_items: 1,
  });
}
