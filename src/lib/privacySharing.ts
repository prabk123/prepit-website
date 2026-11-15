/**
 * The US "Do Not Sell or Share" rule (PRE-539), kept free of browser APIs and
 * imports so it can be tested. California and other US state laws treat the
 * Meta Pixel and ad matching as "sharing" for advertising. A visitor turns it
 * off on /privacy-choices, and a US visitor whose browser sends Global Privacy
 * Control is opted out automatically. Nothing changes for anyone else: UK and
 * EEA visitors choose in the cookie banner, and other countries keep the
 * defaults. The Meta Pixel snippet in app/layout.tsx repeats this rule inline,
 * because it runs before any bundle.
 */

/** The country whose visitors' Global Privacy Control signal is honoured automatically. */
export const GPC_COUNTRY = "US";

/** Why sharing is off for this browser: its own choice, the GPC signal, or null when it is on. */
export type SharingOptOut = "choice" | "gpc" | null;

export function sharingOptOutReason(input: {
  /** The prepit-privacy-opt-out cookie. */
  optOutCookie: string | null | undefined;
  /** `navigator.globalPrivacyControl`. */
  globalPrivacyControl: unknown;
  /** The visitor's country code from the proxy's cookie. */
  country: string | null | undefined;
}): SharingOptOut {
  if (input.optOutCookie === "1") return "choice";
  if (input.globalPrivacyControl === true && input.country === GPC_COUNTRY) return "gpc";
  return null;
}
