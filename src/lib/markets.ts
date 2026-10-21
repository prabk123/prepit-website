/**
 * Where the web funnel sells (PRE-331). Launch is US only: US visitors get
 * the landing page, quiz and bridge with USD prices. The other markets in
 * the Web2App design are waiting on checkout, so "Start my free 7 days" goes
 * to the App Store there. Everywhere else gets the waitlist page.
 *
 * Adding a country to web checkout later is a one-line change here.
 */
export type WebMarket = "web" | "app-store" | "waitlist";

/** Countries that buy on the website (ISO 3166-1 alpha-2). */
export const WEB_CHECKOUT_COUNTRIES: ReadonlySet<string> = new Set(["US"]);

/**
 * The design's other markets, waiting on local prices and checkout rules:
 * the UK, Canada, Australia, New Zealand, Ireland, Malta and Cyprus.
 */
export const APP_STORE_COUNTRIES: ReadonlySet<string> = new Set(["GB", "CA", "AU", "NZ", "IE", "MT", "CY"]);

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
 * The market for a country. An unknown country (no geo header, as in local
 * development) gets the App Store: never sell on the web where we can't tell.
 */
export function webMarketFor(country: string | null | undefined): WebMarket {
  const code = parseCountryCode(country);
  if (!code) return "app-store";
  if (WEB_CHECKOUT_COUNTRIES.has(code)) return "web";
  if (APP_STORE_COUNTRIES.has(code)) return "app-store";
  return "waitlist";
}
