import { PREPIT_PRIVACY_OPT_OUT_COOKIE, readCookie } from "@/lib/cookies";
import { COUNTRY_COOKIE, parseCountryCode } from "@/lib/markets";
import { sharingOptOutReason, type SharingOptOut } from "@/lib/privacySharing";

/** Where "Your Privacy Choices" lives (PRE-539). */
export const PRIVACY_CHOICES_PATH = "/privacy-choices";

declare global {
  interface Navigator {
    /** Global Privacy Control (https://globalprivacycontrol.org): true when the browser asks sites not to sell or share. */
    globalPrivacyControl?: boolean;
  }
}

/** This browser's opt-out of sharing for advertising, read from its cookie and GPC signal. */
export function sharingOptOut(): SharingOptOut {
  if (typeof document === "undefined") return null;
  return sharingOptOutReason({
    optOutCookie: readCookie(PREPIT_PRIVACY_OPT_OUT_COOKIE),
    globalPrivacyControl: typeof navigator === "undefined" ? undefined : navigator.globalPrivacyControl,
    country: parseCountryCode(readCookie(COUNTRY_COOKIE)),
  });
}

/** True when the Meta Pixel, ad matching and campaign attribution must stay off for this browser. */
export function isOptedOutOfSharing(): boolean {
  return sharingOptOut() !== null;
}
