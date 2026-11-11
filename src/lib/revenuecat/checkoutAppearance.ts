import type { BrandingAppearance } from "@revenuecat/purchases-js";

/**
 * How RevenueCat's checkout sheet looks (PRE-467). The sheet opens from the
 * web paywall's "Start my free week" and "Pay with card" buttons. Out of the
 * box it is RevenueCat's pale blue with a blue-grey button. These are the
 * website's colours instead (tokens.css): the cream page the paywall sits on,
 * a white form, a black button, and the site's dark focus ring.
 *
 * It is passed to `presentPaywall` in code rather than set in each Web Billing
 * app's Appearance editor, so the UK and US sellers always match and a change
 * goes through a pull request. RevenueCat lays these values over whatever the
 * dashboard has. purchases-js also hands them to Stripe, so the card fields
 * pick up the same colours.
 *
 * Out of reach from here: the sheet's layout and wording, the "Secure checkout
 * by RevenueCat" footer, and its font. Only a font uploaded in the
 * RevenueCat dashboard changes the headings, and the body text always uses
 * the system font.
 */
export const CHECKOUT_APPEARANCE: Partial<BrandingAppearance> = {
  /** Behind the sheet, and the plan summary: the paywall's cream (--color-paywall-web). */
  color_page_bg: "#efe8e1",
  color_product_info_bg: "#efe8e1",
  /** The card form (--color-paywall). */
  color_form_bg: "#ffffff",
  /** The paywall's black button with white text. */
  color_buttons_primary: "#000000",
  color_buttons_primary_text: "#ffffff",
  /** The focused field's border and other highlights, like the site's form fields (--color-focus). */
  color_accent: "#1a1a2e",
  /** --color-error. */
  color_error: "#b42318",
  /**
   * RevenueCat's "pill" corners: 12px card fields (the most of any option; Stripe
   * only takes them from here) and fully round buttons, which globals.css then
   * brings back to the site's 16px (--radius-button).
   */
  shapes: "pill",
};
