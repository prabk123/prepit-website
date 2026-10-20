"use client";

import type { CustomerInfo, Offering, Package, Purchases } from "@revenuecat/purchases-js";
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
 *   project's current offering when unset. Its paywall, built in the
 *   RevenueCat dashboard, is what checkout shows.
 * - NEXT_PUBLIC_REVENUECAT_OFFERING_ID_NO_TRIAL (optional): an offering with
 *   the same plans, no free trial and its own paywall, for people who already
 *   had one. Without it they're sent to the app instead.
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

/**
 * Premium at any time, from any store, even if it has lapsed. Counts as having
 * had the trial, since the backend's `hasUsedTrial` misses trials from before
 * the webhook synced them and any webhook that was dropped.
 */
export function hadPremium(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.all[PREMIUM_ENTITLEMENT]);
}

/**
 * RevenueCat mounts its checkout in `#rcb-ui-root` on the body, outside our
 * page, and shows the email there. This makes that element ourselves, kept
 * out of session replays, so the SDK reuses it.
 */
export function ensurePrivateCheckoutRoot(): void {
  if (document.getElementById("rcb-ui-root")) return;
  const root = document.createElement("div");
  root.id = "rcb-ui-root";
  root.className = "rcb-ui-root ph-no-capture";
  document.body.appendChild(root);
}

/** Which plan a package is, for analytics: `$rc_annual` / `$rc_monthly`, or by its period. */
export function planIdOf(rcPackage: Package): PlanId | null {
  if (rcPackage.identifier === "$rc_annual") return "annual";
  if (rcPackage.identifier === "$rc_monthly") return "monthly";
  const unit = rcPackage.product.period?.unit;
  if (unit === "year") return "annual";
  if (unit === "month") return "monthly";
  return null;
}

export type CheckoutOffering =
  | { status: "ready"; offering: Offering; hasTrial: boolean }
  /** They had a trial before and no trial-free offering is set up in RevenueCat. */
  | { status: "no_trial_free_plans" }
  /** The offering has no paywall attached in the RevenueCat dashboard. */
  | { status: "no_paywall" };

/**
 * The offering whose RevenueCat paywall checkout shows. Someone who already
 * had a free trial gets the no-trial offering instead, so the paywall never
 * offers them a second one.
 */
export async function loadCheckoutOffering(uid: string, hadTrial: boolean): Promise<CheckoutOffering> {
  const purchases = await purchasesFor(uid);
  const offeringId = hadTrial
    ? process.env.NEXT_PUBLIC_REVENUECAT_OFFERING_ID_NO_TRIAL?.trim()
    : process.env.NEXT_PUBLIC_REVENUECAT_OFFERING_ID?.trim();
  if (hadTrial && !offeringId) return { status: "no_trial_free_plans" };
  const offerings = await purchases.getOfferings(offeringId ? { offeringIdentifier: offeringId } : undefined);
  const offering = (offeringId ? offerings.all[offeringId] : offerings.current) ?? null;
  if (!offering) {
    if (hadTrial) return { status: "no_trial_free_plans" };
    throw new Error("No RevenueCat offering");
  }
  if (!offering.hasPaywall) return { status: "no_paywall" };
  return { status: "ready", offering, hasTrial: !hadTrial };
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
