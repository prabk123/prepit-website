"use client";

import type { CustomerInfo, Package, Purchases, SubscriptionOption } from "@revenuecat/purchases-js";
import { isProductionDeploy } from "@/lib/firebase/config";
import type { PlanId } from "@/lib/pricing";

/**
 * RevenueCat Web Billing checkout (PRE-269). The customer is always the
 * Firebase uid, the same RevenueCat app user id the iPhone app uses, so a web
 * purchase unlocks the app. Never configured for an anonymous customer.
 *
 * Set per deployment:
 * - NEXT_PUBLIC_REVENUECAT_WEB_BILLING_API_KEY: the Web Billing public key.
 *   Sandbox keys (`rcb_sb_…`) everywhere except production; production only
 *   takes a live key. A key on the wrong side is refused.
 * - NEXT_PUBLIC_REVENUECAT_OFFERING_ID (optional): the web offering; the
 *   project's current offering when unset.
 * - NEXT_PUBLIC_REVENUECAT_OFFERING_ID_NO_TRIAL (optional): an offering with
 *   the same plans and no free trial, for people who already had one.
 */

/** The entitlement the app unlocks with (fresca_app RevenueCatService.premiumEntitlement). */
export const PREMIUM_ENTITLEMENT = "premium";

export type CheckoutUnavailable = "not_configured" | "wrong_key_environment";

export function webBillingKeyProblem(): CheckoutUnavailable | null {
  const key = process.env.NEXT_PUBLIC_REVENUECAT_WEB_BILLING_API_KEY?.trim();
  if (!key) return "not_configured";
  const sandbox = key.startsWith("rcb_sb_");
  if (isProductionDeploy() ? sandbox : !sandbox) return "wrong_key_environment";
  return null;
}

let configured: { uid: string; purchases: Promise<Purchases> } | null = null;

/** The Purchases instance for this signed-in uid. */
export function purchasesFor(uid: string): Promise<Purchases> {
  if (!uid) return Promise.reject(new Error("RevenueCat needs the Firebase uid"));
  if (configured?.uid === uid) return configured.purchases;
  const previous = configured;
  const purchases = import("@revenuecat/purchases-js").then(async ({ Purchases }) => {
    if (previous) {
      const instance = await previous.purchases;
      await instance.changeUser(uid);
      return instance;
    }
    return Purchases.configure({
      apiKey: process.env.NEXT_PUBLIC_REVENUECAT_WEB_BILLING_API_KEY!.trim(),
      appUserId: uid,
    });
  });
  configured = { uid, purchases };
  // A failed load or user switch must not stick: the next call starts again.
  purchases.catch(() => {
    if (configured?.purchases === purchases) configured = null;
  });
  return purchases;
}

export function hasPremium(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]);
}

/** One plan as checkout shows it: prices and trial from RevenueCat, not from code. */
export type CheckoutPlan = {
  id: PlanId;
  rcPackage: Package;
  /** The option bought: with the free trial, or without when they already had one. */
  option: SubscriptionOption | null;
  /** e.g. "$99.99" or "£89.99", in the visitor's currency. */
  price: string;
  period: "year" | "month";
  /** Free trial length in days, or null when this purchase has none. */
  trialDays: number | null;
  /** e.g. "$1.92" for the annual plan. */
  pricePerWeek: string | null;
};

function planIdOf(rcPackage: Package): PlanId | null {
  if (rcPackage.identifier === "$rc_annual") return "annual";
  if (rcPackage.identifier === "$rc_monthly") return "monthly";
  const unit = rcPackage.product.period?.unit;
  if (unit === "year") return "annual";
  if (unit === "month") return "monthly";
  return null;
}

function trialDaysOf(option: SubscriptionOption | null): number | null {
  const period = option?.trial?.period;
  if (!period) return null;
  switch (period.unit) {
    case "day":
      return period.number;
    case "week":
      return period.number * 7;
    default:
      return null;
  }
}

function toPlan(rcPackage: Package, withTrial: boolean): CheckoutPlan | null {
  const id = planIdOf(rcPackage);
  if (!id) return null;
  const product = rcPackage.product;
  const options = Object.values(product.subscriptionOptions);
  const option = withTrial
    ? product.defaultSubscriptionOption
    : (options.find((candidate) => candidate.trial === null) ?? null);
  if (!withTrial && option === null && product.defaultSubscriptionOption?.trial) return null;
  const base = option?.base ?? product.defaultSubscriptionOption?.base ?? null;
  return {
    id,
    rcPackage,
    option,
    price: base?.price?.formattedPrice ?? product.price.formattedPrice,
    period: id === "annual" ? "year" : "month",
    trialDays: withTrial ? trialDaysOf(option) : null,
    pricePerWeek: id === "annual" ? (base?.pricePerWeek?.formattedPrice ?? null) : null,
  };
}

export type CheckoutPlans =
  | { status: "ready"; plans: CheckoutPlan[] }
  /** They had a trial before and no trial-free plans are set up in RevenueCat. */
  | { status: "no_trial_free_plans" };

/**
 * The annual and monthly plans, annual first. `hadTrial` drops the free trial:
 * from a trial-free option on the same product, or the no-trial offering.
 */
export async function loadCheckoutPlans(uid: string, hadTrial: boolean): Promise<CheckoutPlans> {
  const purchases = await purchasesFor(uid);
  const offeringId = hadTrial
    ? (process.env.NEXT_PUBLIC_REVENUECAT_OFFERING_ID_NO_TRIAL?.trim() ||
      process.env.NEXT_PUBLIC_REVENUECAT_OFFERING_ID?.trim())
    : process.env.NEXT_PUBLIC_REVENUECAT_OFFERING_ID?.trim();
  const offerings = await purchases.getOfferings(offeringId ? { offeringIdentifier: offeringId } : undefined);
  const offering = (offeringId ? offerings.all[offeringId] : null) ?? offerings.current;
  if (!offering) throw new Error("No RevenueCat offering");

  const plans = offering.availablePackages
    .map((rcPackage) => toPlan(rcPackage, !hadTrial))
    .filter((plan): plan is CheckoutPlan => plan !== null)
    .sort((a, b) => (a.id === b.id ? 0 : a.id === "annual" ? -1 : 1));
  const unique = plans.filter((plan, index) => plans.findIndex((other) => other.id === plan.id) === index);

  if (unique.length === 0 && hadTrial) return { status: "no_trial_free_plans" };
  if (unique.length === 0) throw new Error("No annual or monthly package in the offering");
  return { status: "ready", plans: unique };
}

/** Why a purchase didn't go through, as a fixed code for analytics and the message. */
export type CheckoutFailure =
  | "cancelled"
  | "already_purchased"
  | "payment_pending"
  | "network"
  | "not_allowed"
  | "unknown";

/** The failure code, plus RevenueCat's numeric error code when there is one (for analytics). */
export async function toCheckoutFailure(error: unknown): Promise<{ code: CheckoutFailure; rcErrorCode: number | null }> {
  const { ErrorCode, PurchasesError } = await import("@revenuecat/purchases-js");
  if (!(error instanceof PurchasesError)) return { code: "unknown", rcErrorCode: null };
  const rcErrorCode = error.errorCode;
  switch (error.errorCode) {
    case ErrorCode.UserCancelledError:
      return { code: "cancelled", rcErrorCode };
    case ErrorCode.ProductAlreadyPurchasedError:
      return { code: "already_purchased", rcErrorCode };
    case ErrorCode.PaymentPendingError:
      return { code: "payment_pending", rcErrorCode };
    case ErrorCode.NetworkError:
      return { code: "network", rcErrorCode };
    case ErrorCode.PurchaseNotAllowedError:
    case ErrorCode.IneligibleError:
    case ErrorCode.PurchaseInvalidError:
      return { code: "not_allowed", rcErrorCode };
    default:
      return { code: "unknown", rcErrorCode };
  }
}

const ENTITLEMENT_WAIT_MS = 20_000;
const ENTITLEMENT_POLL_MS = 1_500;

/**
 * Waits until RevenueCat shows `premium` as active for this customer, so the
 * app unlocks when they sign in. True once it's active, false after the wait.
 */
export async function waitForPremium(uid: string, first?: CustomerInfo): Promise<boolean> {
  if (first && hasPremium(first)) return true;
  const purchases = await purchasesFor(uid);
  const deadline = Date.now() + ENTITLEMENT_WAIT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, ENTITLEMENT_POLL_MS));
    try {
      if (hasPremium(await purchases.getCustomerInfo())) return true;
    } catch {
      // Try again until the deadline.
    }
  }
  return false;
}
