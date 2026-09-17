import { PREPIT_ANALYTICS_CONSENT_COOKIE, PREPIT_GEO_COOKIE, readCookie } from "@/lib/cookies";

/** Matches the mobile app's ANALYTICS_ENABLED opt-in pattern. */
export function isAnalyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

export function isPostHogEnabled(): boolean {
  return isAnalyticsEnabled() && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

export function isMetaPixelEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim());
}

export function isEuVisitor(): boolean {
  return readCookie(PREPIT_GEO_COOKIE) === "eu";
}

/** Non-EU captures by default; EU requires an explicit grant. */
export function hasAnalyticsConsent(): boolean {
  if (typeof document === "undefined") return false;
  if (!isEuVisitor()) return true;
  return readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE) === "granted";
}
