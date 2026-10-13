/**
 * PrepIt's trial and prices, as set on the App Store products. Every page that
 * mentions them (pricing card, FAQ, trial notes under App Store buttons) reads
 * them from here, so a price change is a one-file edit.
 */
export const TRIAL_DAYS = 7;

export const PRICES = {
  currency: "USD",
  annual: "$99.99",
  annualValue: "99.99",
  /** The annual price over 52 weeks, rounded. */
  annualPerWeek: "$1.92",
  monthly: "$14.99",
  monthlyValue: "14.99",
} as const;

/** The short line under App Store buttons, e.g. "7 days free". */
export const TRIAL_NOTE = `${TRIAL_DAYS} days free`;
