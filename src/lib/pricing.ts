import type { WebBillingSeller } from "@/lib/revenuecat/sellers";

/**
 * PrepIt's trial and prices, as set on the App Store products and the two
 * Web Billing apps. Every page that mentions them (pricing card, FAQ, trial
 * notes under App Store buttons) reads them from here, so a price change is a
 * one-file edit.
 */
export const TRIAL_DAYS = 7;

/** One currency's prices, already formatted for copy. */
export type Prices = {
  /** ISO 4217 code, sent as `price_currency` on funnel events. */
  currency: "USD" | "GBP";
  annual: string;
  /** The annual price over 52 weeks, rounded. */
  annualPerWeek: string;
  /** The annual price over 12 months, rounded down (the landing page, PRE-302). */
  annualPerMonth: string;
  /** Annual against 12 monthly payments: 1 - 99.99 / (14.99 x 12), rounded down. */
  annualSavingPercent: string;
  monthly: string;
  /** Nothing, in this currency, for "$0 today". */
  free: string;
  /** For "Prices in US dollars." */
  currencyName: string;
};

const USD: Prices = {
  currency: "USD",
  annual: "$99.99",
  annualPerWeek: "$1.92",
  annualPerMonth: "$8.33",
  annualSavingPercent: "44%",
  monthly: "$14.99",
  free: "$0",
  currencyName: "US dollars",
};

/** DocWhizz Ltd's products on the UK Web Billing app (PRE-355): web_uk_annual_7day and web_uk_monthly_7day. */
const GBP: Prices = {
  currency: "GBP",
  annual: "£99.99",
  annualPerWeek: "£1.92",
  annualPerMonth: "£8.33",
  annualSavingPercent: "44%",
  monthly: "£14.99",
  free: "£0",
  currencyName: "pounds sterling",
};

/**
 * What the website sells at, by the company that bills the visitor
 * (lib/revenuecat/sellers.ts, PRE-373): US dollars from DOCWHIZZ, LLC, pounds
 * from DocWhizz Ltd. Pages pick one with `webBillingSellerFor(country)`, so
 * the copy matches the checkout.
 */
export const WEB_PRICES: Record<WebBillingSeller, Prices> = { us: USD, uk: GBP };

/**
 * The App Store prices in US dollars, for pages that send people to the App
 * Store (the homepage), where Apple shows each country its own price.
 */
export const PRICES = USD;

/** The short line under App Store buttons, e.g. "7 days free". */
export const TRIAL_NOTE = `${TRIAL_DAYS} days free`;

/** The two plans sold on the website, as RevenueCat package ids map to them (PRE-269). */
export type PlanId = "annual" | "monthly";

export const PLANS: Record<PlanId, { label: string; period: "year" | "month" }> = {
  annual: { label: "Annual", period: "year" },
  monthly: { label: "Monthly", period: "month" },
};

export function parsePlanId(value: string | null | undefined): PlanId | null {
  return value === "annual" || value === "monthly" ? value : null;
}
