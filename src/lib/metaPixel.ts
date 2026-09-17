"use client";

import { hasAnalyticsConsent, isMetaPixelEnabled } from "@/lib/analytics";

/** Custom Meta Pixel event fired when a user taps an App Store download CTA. */
export const META_PIXEL_APP_STORE_EVENT = "AppStoreClick";

declare global {
  interface Window {
    fbq?: (
      command: "trackCustom" | "track" | "init" | "consent",
      eventName: string,
      params?: Record<string, string>,
    ) => void;
  }
}

function canTrackMeta(): boolean {
  return (
    typeof window !== "undefined" &&
    isMetaPixelEnabled() &&
    hasAnalyticsConsent() &&
    typeof window.fbq === "function"
  );
}

export function grantMetaConsent() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("consent", "grant");
  if (hasAnalyticsConsent()) {
    window.fbq("track", "PageView");
  }
}

export function revokeMetaConsent() {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("consent", "revoke");
}

export function initMetaAdvancedMatching(params: {
  email?: string;
  externalId?: string;
}) {
  if (!canTrackMeta()) return;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!pixelId) return;
  const userData: Record<string, string> = {};
  if (params.email) userData.em = params.email;
  if (params.externalId) userData.external_id = params.externalId;
  if (Object.keys(userData).length === 0) return;
  window.fbq!("init", pixelId, userData);
}

export function trackAppStoreClick(source: string) {
  if (!canTrackMeta()) return;
  window.fbq!("trackCustom", META_PIXEL_APP_STORE_EVENT, { source });
}

export function trackMetaInitiateCheckout() {
  if (!canTrackMeta()) return;
  window.fbq!("track", "InitiateCheckout");
}

export function trackMetaCompleteRegistration(method: string) {
  if (!canTrackMeta()) return;
  window.fbq!("track", "CompleteRegistration", { content_name: method });
}
