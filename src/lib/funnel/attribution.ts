/**
 * First-touch attribution for the Web2App funnels (PRE-266, PRE-302): the
 * campaign (UTM) parameters and ad click ids a visitor landed with, plus the
 * referring site and the landing path. Saved to the pending profile through
 * `PATCH /web-signup/profile` once they sign in, where the backend keeps the
 * first one it gets.
 *
 * Kept in sessionStorage only: it lives as long as the tab, which covers ad,
 * landing page, sign-in and checkout, and it is sent to nothing but our own
 * backend after sign-in. Like PostHog and the Meta Pixel, it is only stored
 * and sent for a known non-EU visitor or after "Accept optional cookies"
 * (click ids exist to match ad conversions); storage and consent are in
 * attributionStore.ts, and this file stays free of browser APIs for its tests.
 */

/** The fields `attributionSchema` accepts (fresca_backend services/pendingProfile.ts). */
export type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  referrer?: string;
  landingPath?: string;
};

/** Query parameter -> field, with the backend's length limit. */
export const QUERY_FIELDS = [
  ["utm_source", "utmSource", 200],
  ["utm_medium", "utmMedium", 200],
  ["utm_campaign", "utmCampaign", 200],
  ["utm_term", "utmTerm", 200],
  ["utm_content", "utmContent", 200],
  ["fbclid", "fbclid", 500],
  ["gclid", "gclid", 500],
  ["ttclid", "ttclid", 500],
] as const;

/**
 * Hosts that aren't where a visitor came from: our own site, and the payment
 * and sign-in pages they come back from mid-funnel. Subdomains count too.
 */
const NOT_REFERRERS = [
  "tryprepit.app",
  "revenuecat.com",
  "rev.cat",
  "stripe.com",
  "stripe.network",
  "paddle.com",
  "appleid.apple.com",
  "accounts.google.com",
  "firebaseapp.com",
];

function isNotReferrer(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return NOT_REFERRERS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

/** Trimmed and capped, or nothing. A value with an "@" is dropped: email tools can put the recipient's address in a UTM. */
function clean(value: string | null | undefined, max: number): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.includes("@")) return undefined;
  return trimmed.slice(0, max);
}

/**
 * The referrer's origin only: a path or query can carry profile names,
 * message ids or search terms. Our own pages, payment and sign-in pages, and
 * anything unparsable give nothing.
 */
export function cleanReferrer(referrer: string | null | undefined, currentHost: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.host.toLowerCase() === currentHost.toLowerCase() || isNotReferrer(url.hostname)) return undefined;
    return url.origin.slice(0, 500);
  } catch {
    return undefined;
  }
}

/** Attribution for a landing on `pathname` + `search` from `referrer`, or null when there is nothing to keep. */
export function parseAttribution(
  search: string,
  pathname: string,
  referrer: string | null | undefined,
  currentHost: string,
): Attribution | null {
  const params = new URLSearchParams(search);
  const attribution: Attribution = {};
  for (const [param, field, max] of QUERY_FIELDS) {
    const value = clean(params.get(param), max);
    if (value) attribution[field] = value;
  }
  const from = cleanReferrer(referrer, currentHost);
  if (from) attribution.referrer = from;
  if (Object.keys(attribution).length === 0) return null;
  attribution.landingPath = clean(pathname, 500) ?? "/";
  return attribution;
}

/** Campaign properties for analytics events: campaign names only, never click ids. */
export function attributionEventProperties(attribution: Attribution | null): Record<string, string> {
  if (!attribution) return {};
  const properties: Record<string, string> = {};
  if (attribution.utmSource) properties.utm_source = attribution.utmSource;
  if (attribution.utmMedium) properties.utm_medium = attribution.utmMedium;
  if (attribution.utmCampaign) properties.utm_campaign = attribution.utmCampaign;
  return properties;
}
