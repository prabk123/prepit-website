/**
 * The UK and EEA 14-day right to cancel (UK Consumer Contracts Regulations
 * 2013, EU Consumer Rights Directive). PrepIt starts as soon as someone
 * subscribes, so before the paywall a UK or EEA buyer asks for it to start
 * now and acknowledges that the right to cancel for a refund ends once it
 * has started. Who is asked is `isEuCountry` (lib/geo.ts: the UK and EEA,
 * and an unknown country), decided on the checkout page. US checkout is
 * unchanged.
 *
 * Changing the wording means a new version, so each record says what was
 * agreed to.
 */
export const WITHDRAWAL_CONSENT_VERSION = "2026-10-21";

/** The paywall shows the trial and prices, so this doesn't repeat them (some buyers get no trial). */
export const WITHDRAWAL_CONSENT_TEXT =
  "Start my PrepIt subscription now. I understand that once it starts, I lose my 14-day right to cancel for a refund. I can still cancel any time at tryprepit.app/account to stop it renewing.";

/**
 * RevenueCat customer attributes that record the consent: when (ISO time),
 * which wording, and the country checkout saw. No personal data.
 */
export function withdrawalConsentAttributes(country: string | null | undefined, now: Date): Record<string, string> {
  return {
    withdrawal_waiver_at: now.toISOString(),
    withdrawal_waiver_version: WITHDRAWAL_CONSENT_VERSION,
    withdrawal_waiver_country: country?.trim().toUpperCase() || "unknown",
  };
}
