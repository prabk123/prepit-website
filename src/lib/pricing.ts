/**
 * PrepIt's trial and prices, as set on the App Store products. Every page that
 * mentions them (pricing card, FAQ, trial notes under App Store buttons) reads
 * them from here, so a price change is a one-file edit.
 */
export const TRIAL_DAYS = 7;

export const PRICES = {
  annual: "$99.99",
  /** The annual price over 52 weeks, rounded. */
  annualPerWeek: "$1.92",
  monthly: "$14.99",
} as const;

/** The short line under App Store buttons, e.g. "7 days free". */
export const TRIAL_NOTE = `${TRIAL_DAYS} days free`;

/** The two plans sold on the website, as RevenueCat package ids map to them (PRE-269). */
export type PlanId = "annual" | "monthly";

export const PLANS: Record<PlanId, { label: string; price: string; period: "year" | "month" }> = {
  annual: { label: "Annual", price: PRICES.annual, period: "year" },
  monthly: { label: "Monthly", price: PRICES.monthly, period: "month" },
};

export function parsePlanId(value: string | null | undefined): PlanId | null {
  return value === "annual" || value === "monthly" ? value : null;
}
