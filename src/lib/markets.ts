/**
 * Where the web funnel sells (PRE-331). Since 2026-10-21 every country buys
 * on the website (landing page, quiz, bridge, checkout), in US dollars until
 * there are local prices. The App Store and waitlist markets stay so a
 * country can be taken off web checkout again with a one-line change here;
 * both lists are empty for now. Which company bills each country, and so
 * which Web Billing app and currency checkout uses, is lib/revenuecat/sellers.ts
 * (PRE-355).
 */
export type WebMarket = "web" | "app-store" | "waitlist";

/** Countries sent to the App Store instead of web checkout (ISO 3166-1 alpha-2). None for now. */
export const APP_STORE_COUNTRIES: ReadonlySet<string> = new Set<string>();

/** Countries that get the waitlist page instead of web checkout. None for now. */
export const WAITLIST_COUNTRIES: ReadonlySet<string> = new Set<string>();

/**
 * Regions (ISO 3166-2, `CC-RR`) that get the waitlist page instead of web
 * checkout, inside a country that buys on the web (PRE-354). Quebec needs
 * everything in French and has its own subscription rules. Geo-IP misses VPNs
 * and travellers, so a Stripe Radar rule on the billing postcode (G, H or J)
 * is the backstop.
 */
export const WAITLIST_REGIONS: ReadonlySet<string> = new Set<string>(["CA-QC"]);

/** Request header the proxy passes the visitor's country to pages in. */
export const COUNTRY_HEADER = "x-prepit-country";

/** Cookie with the visitor's country, for client-side analytics. */
export const COUNTRY_COOKIE = "prepit-country";

/**
 * Preview-only override cookie, set by `?country=XX` on a non-production
 * deploy, so the US flow can be tested from anywhere.
 */
export const COUNTRY_OVERRIDE_COOKIE = "prepit-country-override";

/** Preview-only region override cookie, set by `?region=QC` the same way. */
export const REGION_OVERRIDE_COOKIE = "prepit-region-override";

/** A two-letter country code, upper-cased, or null. */
export function parseCountryCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/** A region code (the part after the dash in ISO 3166-2, like `QC`), upper-cased, or null. */
export function parseRegionCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z0-9]{1,3}$/.test(code) ? code : null;
}

/** `CC-RR` when the country's region is on `WAITLIST_REGIONS`, else null. */
export function waitlistRegionFor(country: string | null | undefined, region: string | null | undefined): string | null {
  const countryCode = parseCountryCode(country);
  const regionCode = parseRegionCode(region);
  if (!countryCode || !regionCode) return null;
  const key = `${countryCode}-${regionCode}`;
  return WAITLIST_REGIONS.has(key) ? key : null;
}

/**
 * The market for a country (and region, when known): web checkout unless
 * the country or region is on one of the lists above. An unknown country (no
 * geo header, as in local development) buys on the web too.
 */
export function webMarketFor(country: string | null | undefined, region?: string | null): WebMarket {
  const code = parseCountryCode(country);
  if (code && APP_STORE_COUNTRIES.has(code)) return "app-store";
  if (code && WAITLIST_COUNTRIES.has(code)) return "waitlist";
  if (waitlistRegionFor(code, region)) return "waitlist";
  return "web";
}

/** Names for the waitlist page, by `WAITLIST_REGIONS` key. */
export const WAITLIST_REGION_NAMES: Readonly<Record<string, string>> = { "CA-QC": "Quebec" };
