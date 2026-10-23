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

/** Request header the proxy passes the visitor's country to pages in. */
export const COUNTRY_HEADER = "x-prepit-country";

/** Cookie with the visitor's country, for client-side analytics. */
export const COUNTRY_COOKIE = "prepit-country";

/**
 * Preview-only override cookie, set by `?country=XX` on a non-production
 * deploy, so the US flow can be tested from anywhere.
 */
export const COUNTRY_OVERRIDE_COOKIE = "prepit-country-override";

/** A two-letter country code, upper-cased, or null. */
export function parseCountryCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

/**
 * The market for a country: web checkout unless the country is on one of the
 * lists above. An unknown country (no geo header, as in local development)
 * buys on the web too.
 */
export function webMarketFor(country: string | null | undefined): WebMarket {
  const code = parseCountryCode(country);
  if (code && APP_STORE_COUNTRIES.has(code)) return "app-store";
  if (code && WAITLIST_COUNTRIES.has(code)) return "waitlist";
  return "web";
}
