/**
 * First-touch attribution for the Web2App funnels (PRE-266, PRE-302): the
 * campaign (UTM) parameters and ad click ids a visitor landed with, plus the
 * referring site and the landing path. Saved to the pending profile through
 * `PATCH /web-signup/profile` once they sign in, where the backend keeps the
 * first one it gets.
 *
 * Kept in sessionStorage only: it lives as long as the tab, which covers ad,
 * landing page, sign-in and checkout, and it is sent to nothing but our own
 * backend after sign-in.
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
const QUERY_FIELDS = [
  ["utm_source", "utmSource", 200],
  ["utm_medium", "utmMedium", 200],
  ["utm_campaign", "utmCampaign", 200],
  ["utm_term", "utmTerm", 200],
  ["utm_content", "utmContent", 200],
  ["fbclid", "fbclid", 500],
  ["gclid", "gclid", 500],
  ["ttclid", "ttclid", 500],
] as const;

const STORAGE_KEY = "prepit.attribution.v1";

/** Visitors on these hosts are already on the site, so they aren't a referrer. */
const OWN_HOSTS = new Set(["tryprepit.app", "www.tryprepit.app"]);

function clean(value: string | null | undefined, max: number): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

/**
 * The referrer as origin and path only: a query string can carry someone's
 * search terms or ids. Our own pages and anything unparsable give nothing.
 */
export function cleanReferrer(referrer: string | null | undefined, currentHost: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.host.toLowerCase() === currentHost.toLowerCase() || OWN_HOSTS.has(url.hostname.toLowerCase())) return undefined;
    return clean(`${url.origin}${url.pathname === "/" ? "" : url.pathname}`, 500);
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

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

/** The attribution kept for this tab, or null. */
export function readAttribution(): Attribution | null {
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    // Only known string fields come back out.
    const attribution: Attribution = {};
    for (const [, field, max] of QUERY_FIELDS) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === "string" && value) attribution[field] = value.slice(0, max);
    }
    for (const field of ["referrer", "landingPath"] as const) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === "string" && value) attribution[field] = value.slice(0, 500);
    }
    return Object.keys(attribution).length > 0 ? attribution : null;
  } catch {
    return null;
  }
}

/**
 * Keeps the first attribution in this tab (first touch, as the backend does).
 * Later pages, including a second campaign landing, leave it as it is.
 */
export function captureAttribution(location: { search: string; pathname: string; host: string }, referrer: string) {
  const store = storage();
  if (!store || readAttribution()) return;
  const landed = parseAttribution(location.search, location.pathname, referrer, location.host);
  if (!landed) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(landed));
  } catch {
    // Storage full or blocked: the funnel works without attribution.
  }
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
