"use client";

import type { CustomerInfo, Offering, Package, Purchases } from "@revenuecat/purchases-js";
import { readCookie } from "@/lib/cookies";
import { isProductionDeploy } from "@/lib/firebase/config";
import { mayKeepAttribution, readAttribution } from "@/lib/funnel/attributionStore";
import { metaMatchingAttributes } from "@/lib/metaMatching";
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
 *
 * Checkout shows the paywall of the project's current offering, so which
 * offering, plans and paywall people see is changed in RevenueCat with no
 * deploy. Who gets the free trial is RevenueCat's call too: each Web Billing
 * product's trial eligibility setting decides at purchase.
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

export type MetaMatchingResult = {
  has_email: boolean;
  has_ip: boolean;
  has_fbp: boolean;
  has_fbc: boolean;
  /** False when RevenueCat refused or didn't get that call (or there was nothing to send). */
  identity_saved: boolean;
  ids_saved: boolean;
  browser_saved: boolean;
};

/**
 * Gives RevenueCat what its Meta integration matches a web purchase on: the
 * Meta Pixel's `_fbp` / `_fbc` (or one built from the ad click id), the
 * sign-in email, the IP address (from /api/client-ip), the user agent and the
 * page address (metaMatching.ts). Called
 * on checkout before the paywall, so it is on the customer when RevenueCat
 * sends the trial or purchase to Meta. Only under the pixel's own rule (known
 * non-EU visitor, or "Accept optional cookies"); otherwise nothing is sent.
 * The web SDK doesn't retry attributes, so a failure is reported, not thrown.
 */
export async function sendMetaMatchingToRevenueCat(uid: string, email: string | null): Promise<MetaMatchingResult | null> {
  if (!mayKeepAttribution()) return null;
  const ip = await fetch("/api/client-ip", { cache: "no-store" })
    .then((response) => (response.ok ? (response.json() as Promise<{ ip?: string | null }>) : null))
    .then((body) => body?.ip ?? null)
    .catch(() => null);
  const { identity, ids, browser } = metaMatchingAttributes({
    fbpCookie: readCookie("_fbp"),
    fbcCookie: readCookie("_fbc"),
    fbclid: readAttribution()?.fbclid,
    email,
    ip,
    userAgent: navigator.userAgent,
    pageUrl: window.location.href,
    now: Date.now(),
  });
  const purchases = await purchasesFor(uid);
  const save = async (attributes: Record<string, string>) => {
    if (Object.keys(attributes).length === 0) return false;
    try {
      await purchases.setAttributes(attributes);
      return true;
    } catch {
      return false;
    }
  };
  // Separate calls, so one refused key can't lose the others.
  const [identitySaved, idsSaved, browserSaved] = await Promise.all([save(identity), save(ids), save(browser)]);
  return {
    has_email: "$email" in identity,
    has_ip: "$ip" in identity,
    has_fbp: "$fbp" in ids,
    has_fbc: "$fbc" in ids,
    identity_saved: identitySaved,
    ids_saved: idsSaved,
    browser_saved: browserSaved,
  };
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

/**
 * The plan the visitor came for (annual when none was picked), its id and
 * price, for Meta's InitiateCheckout. Null when the offering has no such plan.
 */
export function checkoutValueFor(
  offering: Offering,
  requestedPlan: PlanId | null,
): { value: number; currency: string; plan: PlanId } | null {
  const plan = requestedPlan ?? "annual";
  const rcPackage = offering.availablePackages.find((candidate) => planIdOf(candidate) === plan);
  const price = rcPackage?.webBillingProduct.price;
  if (!price) return null;
  return { value: price.amountMicros / 1_000_000, currency: price.currency, plan };
}

export type CheckoutOffering =
  | { status: "ready"; offering: Offering }
  /** The offering has no paywall attached in the RevenueCat dashboard. */
  | { status: "no_paywall" };

/** Whether RevenueCat offers this customer the free trial on this package. */
export function packageOffersTrial(rcPackage: Package): boolean {
  return rcPackage.webBillingProduct.freeTrialPhase != null;
}

/** Whether RevenueCat offers this customer the free trial on any of the offering's packages. */
export function offeringOffersTrial(offering: Offering): boolean {
  return offering.availablePackages.some(packageOffersTrial);
}

/** The current offering, whose RevenueCat paywall checkout shows. */
export async function loadCheckoutOffering(uid: string): Promise<CheckoutOffering> {
  const purchases = await purchasesFor(uid);
  const offering = (await purchases.getOfferings()).current;
  if (!offering) throw new Error("No current RevenueCat offering");
  if (!offering.hasPaywall) return { status: "no_paywall" };
  return { status: "ready", offering };
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

/** Where the visitor's PrepIt subscription is billed, for the account page (PRE-304). */
export type BillingPlace = "web" | "legacy_web" | "app_store" | "play_store" | "other";

export type PremiumDetails = {
  place: BillingPlace;
  /** Renewal or end date, when RevenueCat has one. */
  expirationDate: Date | null;
  willRenew: boolean;
};

/** The active `premium` entitlement, or null when there is none. */
export async function loadPremiumDetails(uid: string): Promise<PremiumDetails | null> {
  const purchases = await purchasesFor(uid);
  const entitlement = (await purchases.getCustomerInfo()).entitlements.active[PREMIUM_ENTITLEMENT];
  if (!entitlement) return null;
  const store = entitlement.store;
  // Only Web Billing (rc_billing) has a portal the backend can open. Older
  // Stripe or Paddle subscriptions were bought on the web too, but go to support.
  const place: BillingPlace =
    store === "rc_billing"
      ? "web"
      : store === "stripe" || store === "paddle"
        ? "legacy_web"
        : store === "app_store" || store === "mac_app_store"
          ? "app_store"
          : store === "play_store"
            ? "play_store"
            : "other";
  return { place, expirationDate: entitlement.expirationDate, willRenew: entitlement.willRenew };
}
