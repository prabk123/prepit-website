/**
 * Which company sells a website subscription (PRE-355). Each has its own
 * RevenueCat Web Billing app on its own Stripe account, in the same RevenueCat
 * project, so the `premium` entitlement, the customer (the Firebase uid) and
 * the backend webhook are shared:
 * - `us`: DOCWHIZZ, LLC on the US Stripe account.
 * - `uk`: DocWhizz Ltd on the UK Stripe account.
 */
export type WebBillingSeller = "us" | "uk";

/** Countries the US company sells to (ISO 3166-1 alpha-2). Everyone else buys from the UK company. */
export const US_SELLER_COUNTRIES: ReadonlySet<string> = new Set(["US", "CA", "AU", "NZ"]);

/**
 * The company a visitor in this country buys from. An unknown country (no geo
 * header) goes to the UK company, as the site already applies UK/EEA rules
 * (consent banner, right-to-cancel box) when it can't tell.
 */
export function webBillingSellerFor(country: string | null | undefined): WebBillingSeller {
  // Same reading as parseCountryCode (lib/markets.ts), kept here so the node tests load this file alone.
  const code = country?.trim().toUpperCase() ?? "";
  return US_SELLER_COUNTRIES.has(code) ? "us" : "uk";
}

export type WebBillingKeys = {
  /** Today's single key (before PRE-355), used for any seller whose own key isn't set. */
  shared?: string | null;
  us?: string | null;
  uk?: string | null;
};

/**
 * The public Web Billing key for a seller. Until that seller's own key is set
 * it uses the shared key, which is how the site sold before PRE-355, so this
 * ships before the second app exists and each key can be added on its own.
 * `fellBack` says the shared key was used, so whose Stripe account it bills
 * is whatever that key's app is on.
 */
export function webBillingKeyFor(
  seller: WebBillingSeller,
  keys: WebBillingKeys,
): { apiKey: string | null; seller: WebBillingSeller; fellBack: boolean } {
  const own = keys[seller]?.trim() || null;
  if (own) return { apiKey: own, seller, fellBack: false };
  return { apiKey: keys.shared?.trim() || null, seller, fellBack: true };
}
