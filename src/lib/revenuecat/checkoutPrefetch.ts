"use client";

import type { CustomerInfo } from "@revenuecat/purchases-js";
import { preconnect } from "react-dom";
import { checkoutTimer } from "@/lib/funnel/checkoutTimings";
import { PAYWALL_ORIGINS, paywallFontUrls, preloadPaywallFonts } from "@/lib/revenuecat/paywallWarmup";
import type { WebBillingSeller } from "@/lib/revenuecat/sellers";
import { loadCheckoutOffering, purchasesFor, type CheckoutOffering } from "@/lib/revenuecat/webBilling";

/**
 * Everything checkout needs from RevenueCat before it can show the paywall
 * (PRE-464), started as soon as the visitor is signed in instead of after the
 * PrepIt account has loaded and been saved. The customer info (the "already
 * subscribed?" check) and the offering are fetched at the same time, not one
 * after the other.
 *
 * The answer is kept for this uid, seller and `generation` (Checkout's Try
 * again count) for two minutes, so /start can start it on sign-in and Checkout
 * picks the same answer up when it mounts. A failure is never kept.
 */
export type CheckoutPrefetch = { customerInfo: CustomerInfo; offering: CheckoutOffering };

const KEEP_MS = 2 * 60_000;

let cached: { key: string; at: number; promise: Promise<CheckoutPrefetch> } | null = null;

export function prefetchCheckout(uid: string, seller: WebBillingSeller, generation = 0): Promise<CheckoutPrefetch> {
  const key = `${uid}:${seller}:${generation}`;
  if (cached && cached.key === key && Date.now() - cached.at < KEEP_MS) return cached.promise;
  checkoutTimer.start(uid);
  preconnectToPaywall();
  const purchases = purchasesFor(uid, seller);
  purchases.then(
    () => checkoutTimer.mark(uid, "rc_ready"),
    () => undefined,
  );
  const customerInfo = purchases
    .then((instance) => instance.getCustomerInfo())
    .then((info) => {
      checkoutTimer.mark(uid, "customer_info");
      return info;
    });
  const offering = loadCheckoutOffering(uid, seller).then((loaded) => {
    checkoutTimer.mark(uid, "offering");
    // The paywall's fonts start now, while the SDK still has its own fetches to do.
    if (loaded.status === "ready") preloadPaywallFonts(paywallFontUrls(loaded.offering));
    return loaded;
  });
  const promise = Promise.all([customerInfo, offering]).then(([info, loaded]) => ({ customerInfo: info, offering: loaded }));
  const entry = { key, at: Date.now(), promise };
  cached = entry;
  promise.catch(() => {
    if (cached === entry) cached = null;
  });
  return promise;
}

/**
 * Loads RevenueCat's SDK code in the background (it is a separate chunk), so
 * it is already in the browser when the visitor signs in. Never throws.
 */
export function warmPurchasesSdk(): void {
  void import("@revenuecat/purchases-js").catch(() => undefined);
}

/**
 * Opens the connections the paywall needs first: RevenueCat's API, then its
 * icon and font hosts. React adds each `<link rel="preconnect">` once. The
 * pages that show checkout also ask for these on the server.
 */
export function preconnectToPaywall(): void {
  preconnect(PAYWALL_ORIGINS.api);
  preconnect(PAYWALL_ORIGINS.icons);
  preconnect(PAYWALL_ORIGINS.fonts, { crossOrigin: "anonymous" });
}
