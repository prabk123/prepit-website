/** Custom Meta Pixel event fired when a user taps an App Store download CTA. */
export const META_PIXEL_APP_STORE_EVENT = "AppStoreClick";

declare global {
  interface Window {
    fbq?: (
      command: "trackCustom",
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
