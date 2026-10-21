import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import { isEuCountry } from "@/lib/geo";
import { COUNTRY_HEADER, parseCountryCode } from "@/lib/markets";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  title: "Choose your plan",
  description: "Start your PrepIt subscription.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * Web checkout with RevenueCat Web Billing, for a signed-in visitor (PRE-269).
 * The country (from the proxy, which honours the preview `?country=` pin)
 * decides whether the UK/EEA right-to-cancel consent comes first.
 */
export default async function CheckoutPage() {
  const country = parseCountryCode((await headers()).get(COUNTRY_HEADER));
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <Suspense fallback={<p className="text-body text-ink-secondary">Loading…</p>}>
        <Checkout country={country} askWithdrawalConsent={isEuCountry(country ?? undefined)} />
      </Suspense>
    </NarrowCard>
  );
}
