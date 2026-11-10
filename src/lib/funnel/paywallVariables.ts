/**
 * The web paywall's custom variables (PRE-462). RevenueCat's hosted paywall on
 * the `web_checkout` offering is Charlie's paywall design built in the
 * RevenueCat editor; the lines RevenueCat can't know (the dated free week in
 * the visitor's date style, the quiz's saved plan, the live App Store rating,
 * the selling company) are worked out here and passed to `presentPaywall` as
 * `customVariables`, read in the paywall as `{{ custom.<name> }}`.
 *
 * Every name here must also be defined in the RevenueCat project (paywall UI
 * config, custom variables), or the paywall shows the dashboard default.
 *
 * Kept free of React, of the SDK and of other modules' values so the node
 * tests load it on its own.
 */

/** The offering whose paywall reads these variables. Any other offering gets none. */
export const WEB_PAYWALL_OFFERING_ID = "web_checkout";
/** The RevenueCat placement the website asks for; a targeting rule serves `web_checkout` there. */
export const WEB_PAYWALL_PLACEMENT = "web_checkout";

/**
 * Whether an offering carries the web paywall: `web_checkout` itself, or any
 * offering marked with metadata `surface: "web"` (an experiment's variant, for
 * example), so a test of a second web paywall still gets these variables.
 */
export function isWebPaywallOffering(
  offering: { identifier: string; metadata?: Record<string, unknown> | null } | null | undefined,
): boolean {
  if (!offering) return false;
  return offering.identifier === WEB_PAYWALL_OFFERING_ID || offering.metadata?.surface === "web";
}

/**
 * How dates read: "us" ("Thu, Nov 12") in the US and Canada, "gb" ("Thu 12 Nov")
 * everywhere else, Australia and New Zealand included.
 */
export type PaywallDateStyle = "us" | "gb";

export function paywallDateStyle(country: string | null | undefined): PaywallDateStyle {
  const code = country?.trim().toUpperCase();
  return code === "US" || code === "CA" ? "us" : "gb";
}

/** An App Store rating as Apple's lookup gives it. */
export type AppStoreRating = { average: number; count: number; storefront: string };

/**
 * Charlie's rating rule (9 Nov): show only at 4.5 or more from 5 or more
 * ratings; say "5 stars" only while the average rounds to 5.0, otherwise the
 * real figure ("Rated 4.8 stars"). No count. Null when it doesn't show.
 */
export function ratingLine(rating: AppStoreRating | null | undefined): string | null {
  if (!rating || !Number.isFinite(rating.average) || rating.count < 5 || rating.average < 4.5) return null;
  const rounded = Math.round(rating.average * 10) / 10;
  const stars = rounded >= 5 ? "5" : rounded.toFixed(1);
  const store =
    rating.storefront === "gb" ? "the UK App Store" : rating.storefront === "us" ? "the US App Store" : "the App Store";
  return `Rated ${stars} stars on ${store}`;
}

/**
 * Day 1 is today; the same days as the cart. A copy of `trialDay` in cart.ts:
 * the node tests load this file on its own, and they can't resolve an
 * extensionless import of cart.ts.
 */
function day(n: number, today: Date): Date {
  const date = new Date(today);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + n - 1);
  return date;
}

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

/** UK "Thu 12 Nov", US "Thu, Nov 12". */
export function shortPaywallDate(date: Date, style: PaywallDateStyle): string {
  return style === "us"
    ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** UK "12 November 2026", US "November 12, 2026". */
export function longPaywallDate(date: Date, style: PaywallDateStyle): string {
  return date.toLocaleDateString(style === "us" ? "en-US" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** UK "16 Nov 2027", US "Nov 16, 2027". */
function yearDate(date: Date, style: PaywallDateStyle): string {
  return date.toLocaleDateString(style === "us" ? "en-US" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** 12 × monthly − annual, in the offering's currency: "£79.89". Null without both prices. */
export function annualSaving(
  annual: { amountMicros: number; currency: string } | null | undefined,
  monthly: { amountMicros: number; currency: string } | null | undefined,
): string | null {
  if (!annual || !monthly || annual.currency !== monthly.currency) return null;
  const cents = Math.round((monthly.amountMicros * 12 - annual.amountMicros) / 10_000);
  if (cents <= 0) return null;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: annual.currency }).format(cents / 100);
  } catch {
    return null;
  }
}

/** A year on, kept in the same month: 29 Feb renews on 28 Feb, as the card is charged. */
function aYearOn(date: Date): Date {
  const next = new Date(date);
  next.setFullYear(date.getFullYear() + 1);
  if (next.getMonth() !== date.getMonth()) next.setDate(0);
  return next;
}

/** "the 16th of each month"; from the 29th on, shorter months renew on their last day. */
function monthlyRenewal(day: number): string {
  return day > 28 ? `the ${ordinal(day)} of each month, or the last day of shorter months` : `the ${ordinal(day)} of each month`;
}

export type PaywallVariableInput = {
  today: Date;
  /** `paywallDateStyle(country)`. */
  dateStyle: PaywallDateStyle;
  /**
   * Whether RevenueCat offers this account the free week. Without it they pay
   * today, so renewals count from today and there is no reminder email.
   */
  trial: boolean;
  /** "DocWhizz Ltd" or "DOCWHIZZ, LLC" (`WEB_BILLING_SELLER_NAMES`). */
  sellerName: string;
  /** UK, Ireland, the EEA and an unknown country: the legal 14-day line stays in the full terms. */
  refundWindow: boolean;
  /** `WEB_REMINDER_EMAIL_LIVE` (lib/pricing.ts). */
  reminder: boolean;
  /** The quiz's saved plan; null for landing visitors or another browser. */
  savedPlan: { forLine: string; calories?: number; proteinGrams?: number } | null;
  rating: AppStoreRating | null;
  /** Whether the account was just created from the quiz ("Your plan is saved.") or not ("You’re signed in."). */
  signedInTitle: string;
  saving: string | null;
  /** "pounds sterling" when the offering is in the seller's own currency, else null (no note). */
  currencyName: string | null;
};

export type PaywallVariables = Record<string, string | boolean>;

/** "1,330 kcal and 160 g protein a day", or null without both targets. */
function targetsLine(plan: PaywallVariableInput["savedPlan"]): string | null {
  if (!plan?.calories || !plan.proteinGrams) return null;
  return `${plan.calories.toLocaleString("en-US")} kcal and ${plan.proteinGrams} g protein a day`;
}

/** Every custom variable the web paywall reads, as plain values. */
export function buildPaywallVariables(input: PaywallVariableInput): PaywallVariables {
  const { today, dateStyle: style, trial } = input;
  const reminder = day(4, today);
  const session3 = day(7, today);
  // With the free week the first payment is day 8; without it, today.
  const charge = day(trial ? 8 : 1, today);
  const rating = ratingLine(input.rating);
  const targets = targetsLine(input.savedPlan);
  const forLine = targets ? (input.savedPlan?.forLine ?? null) : null;
  return {
    show_rating: rating !== null,
    rating_line: rating ?? "",
    signed_in_line: input.signedInTitle,
    show_saved_plan: targets !== null,
    plan_for: forLine ?? "",
    plan_targets: targets ?? "",
    show_reminder: trial && input.reminder,
    date_today: shortPaywallDate(today, style),
    date_reminder: shortPaywallDate(reminder, style),
    date_session3: shortPaywallDate(session3, style),
    date_first_payment: shortPaywallDate(charge, style),
    date_first_payment_long: longPaywallDate(charge, style),
    date_reminder_long: longPaywallDate(reminder, style),
    renewal_annual: yearDate(aYearOn(charge), style),
    renewal_monthly: monthlyRenewal(charge.getDate()),
    annual_saving: input.saving ?? "",
    seller_name: input.sellerName,
    currency_note: input.currencyName ? `Prices in ${input.currencyName}.` : "",
    show_refund_window: input.refundWindow,
  };
}

/** The SDK's typed form (`CustomVariableValue`), built here so this file doesn't load purchases-js. */
export type TypedPaywallVariable = { type: "string"; value: string } | { type: "boolean"; value: boolean };

export function typedPaywallVariables(values: PaywallVariables): Record<string, TypedPaywallVariable> {
  return Object.fromEntries(
    Object.entries(values).map(([name, value]) => [
      name,
      typeof value === "boolean" ? { type: "boolean", value } : { type: "string", value },
    ]),
  );
}
