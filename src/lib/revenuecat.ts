"use client";

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

export async function presentPaywall(
  appUserId: string,
  options: PresentPaywallOptions = {},
): Promise<void> {
  if (presentPaywallInFlight) return presentPaywallInFlight;
  presentPaywallInFlight = (async () => {
    const client = await configurePurchases(appUserId);
    await client.presentPaywall(options);
  })().finally(() => {
    presentPaywallInFlight = null;
  });
  return presentPaywallInFlight;
}
