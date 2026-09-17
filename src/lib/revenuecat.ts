"use client";

import { getAttribution, facebookBrowserId, facebookClickId } from "@/lib/attribution";

export const PREMIUM_ENTITLEMENT = "premium";

type PresentPaywallOptions = {
  htmlTarget?: HTMLElement;
  customerEmail?: string;
  onBack?: (closePaywall: () => void) => void;
};

type PurchasesInstance = {
  getCustomerInfo: () => Promise<{
    entitlements: { active: Record<string, unknown> };
  }>;
  presentPaywall: (options: PresentPaywallOptions) => Promise<unknown>;
  setAttributes: (attributes: Record<string, string | null>) => Promise<void>;
};

let configuredForUid: string | null = null;
let purchases: PurchasesInstance | null = null;
let presentPaywallInFlight: Promise<void> | null = null;

export function isRevenueCatConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY?.trim());
}

export async function configurePurchases(appUserId: string): Promise<PurchasesInstance> {
  if (purchases && configuredForUid === appUserId) return purchases;
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_WEB_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_REVENUECAT_WEB_API_KEY is not configured");
  }
  const { Purchases } = await import("@revenuecat/purchases-js");
  purchases = Purchases.configure({
    apiKey,
    appUserId,
  }) as unknown as PurchasesInstance;
  configuredForUid = appUserId;
  return purchases;
}

export async function hasPremiumEntitlement(appUserId: string): Promise<boolean> {
  const client = await configurePurchases(appUserId);
  const info = await client.getCustomerInfo();
  return Boolean(info.entitlements.active[PREMIUM_ENTITLEMENT]);
}

function compactAttributes(values: Record<string, string | undefined>): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value && value.trim()) attributes[key] = value.trim();
  }
  return attributes;
}

/** Feeds RevenueCat Meta / PostHog integrations before Web Billing checkout. */
export async function syncWebBillingAttributes(
  appUserId: string,
  extras?: { email?: string | null },
): Promise<void> {
  const client = await configurePurchases(appUserId);
  const attribution = getAttribution();
  const reserved = compactAttributes({
    $email: extras?.email ?? undefined,
    $posthogUserId: appUserId,
    $mediaSource: attribution.utm_source,
    $campaign: attribution.utm_campaign,
    $adGroup: attribution.utm_content,
    $keyword: attribution.utm_term,
  });
  const webMatch = compactAttributes({
    $fbp: facebookBrowserId(),
    $fbc: facebookClickId(),
    $userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    $pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
  });

  if (typeof client.setAttributes !== "function") return;
  if (Object.keys(reserved).length > 0) {
    await client.setAttributes(reserved);
  }
  if (Object.keys(webMatch).length === 0) return;
  try {
    await client.setAttributes(webMatch);
  } catch {
    // $fbp / $fbc / $userAgent / $pageUrl are used by Meta web matching but
    // are not in the purchases-js reserved enum. Ignore if the API rejects them.
  }
}

export async function presentPaywall(
  appUserId: string,
  options: PresentPaywallOptions = {},
): Promise<void> {
  if (presentPaywallInFlight) return presentPaywallInFlight;
  presentPaywallInFlight = (async () => {
    const client = await configurePurchases(appUserId);
    await syncWebBillingAttributes(appUserId, { email: options.customerEmail });
    await client.presentPaywall(options);
  })().finally(() => {
    presentPaywallInFlight = null;
  });
  return presentPaywallInFlight;
}
