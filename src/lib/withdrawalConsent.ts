/**
 * The UK and EEA 14-day right to cancel (UK Consumer Contracts Regulations
 * 2013, EU Consumer Rights Directive). PrepIt starts as soon as someone
 * subscribes. A UK or EEA buyer can ask, with an unticked box above the
 * sign-in buttons (PRE-356), for their access to start inside the 14 days;
 * if they then cancel within the 14 days we keep the cost of the days they
 * used instead of refunding in full. The box is optional: buying works
 * either way. Who is asked is `isEuCountry` (lib/geo.ts: the UK and EEA,
 * and an unknown country), decided on the page. US checkout is unchanged.
 *
 * Changing the wording means a new version, so each record says what was
 * agreed to. 2026-10-21 was the older required box ("I lose my 14-day right
 * to cancel for a refund") on the checkout page.
 */
export const WITHDRAWAL_CONSENT_VERSION = "2026-10-23";

/** The paywall shows the trial and prices, so this doesn't repeat them (some buyers get no trial). */
export const WITHDRAWAL_CONSENT_TEXT =
  "Start my access now. If I cancel within my 14-day cancellation period, I'll pay for the days I've used.";

/**
 * RevenueCat customer attributes that record the request to start now: when
 * it was ticked (ISO time), which wording, and the country the page saw.
 * Only saved when the box was ticked. No personal data.
 */
export function withdrawalConsentAttributes(country: string | null | undefined, at: Date): Record<string, string> {
  return {
    withdrawal_waiver_at: at.toISOString(),
    withdrawal_waiver_version: WITHDRAWAL_CONSENT_VERSION,
    withdrawal_waiver_country: country?.trim().toUpperCase() || "unknown",
  };
}

/** Where the box was answered, for analytics. */
export type StartNowAskedOn = "start" | "signin" | "checkout";

/**
 * The buyer's answer before sign-in, kept until checkout can save it on the
 * RevenueCat customer (sign-in comes first, so there's no uid yet). `at` is
 * when the box was ticked, null when it was left unticked.
 */
export type StartNowChoice = { startNow: boolean; at: string | null; version: string; askedOn: StartNowAskedOn };

const STORAGE_KEY = "prepit.startNow.v1";

/** Parses a stored choice; one saved under older wording doesn't count. Exported for tests. */
export function parseStartNowChoice(raw: string | null): StartNowChoice | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (typeof value.startNow !== "boolean" || value.version !== WITHDRAWAL_CONSENT_VERSION) return null;
    if (value.askedOn !== "start" && value.askedOn !== "signin" && value.askedOn !== "checkout") return null;
    const at = typeof value.at === "string" && !Number.isNaN(Date.parse(value.at)) ? value.at : null;
    if (value.startNow && !at) return null;
    return { startNow: value.startNow, at: value.startNow ? at : null, version: value.version, askedOn: value.askedOn };
  } catch {
    return null;
  }
}

/** The choice for a tick (or untick) of the box now. */
export function startNowChoice(startNow: boolean, askedOn: StartNowAskedOn, now: Date): StartNowChoice {
  return { startNow, at: startNow ? now.toISOString() : null, version: WITHDRAWAL_CONSENT_VERSION, askedOn };
}

/** Session storage, so it ends with the tab. */
export function writeStartNowChoice(choice: StartNowChoice): void {
  try {
    if (typeof window !== "undefined") window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // Blocked storage: checkout asks again.
  }
}

export function readStartNowChoice(): StartNowChoice | null {
  try {
    return typeof window === "undefined" ? null : parseStartNowChoice(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}
