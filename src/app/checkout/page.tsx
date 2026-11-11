import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { preconnect } from "react-dom";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { HideSiteChrome } from "@/components/SiteChrome";
import { isEuCountry } from "@/lib/euCountries";
import { buildCartMarket } from "@/lib/funnel/cart";
import { COUNTRY_HEADER, parseCountryCode } from "@/lib/markets";
import { WEB_PRICES } from "@/lib/pricing";
import { PAYWALL_ORIGINS } from "@/lib/revenuecat/paywallWarmup";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";
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
 * picks the company that sells (PRE-355). The paywall fills the page under a
 * slim header with the signed-in account, like the /start bridge (PRE-375):
 * no site header or footer, nothing that leads away mid-checkout.
 */
export default async function CheckoutPage() {
  // RevenueCat's paywall is the next thing this page shows (PRE-464): open its connections early.
  preconnect(PAYWALL_ORIGINS.api);
  preconnect(PAYWALL_ORIGINS.icons);
  preconnect(PAYWALL_ORIGINS.fonts, { crossOrigin: "anonymous" });
  const country = parseCountryCode((await headers()).get(COUNTRY_HEADER));
  const seller = webBillingSellerFor(country);
  // The same 14-day refund rule as the cart on /start.
  const { refundWindow } = buildCartMarket({
    country,
    seller,
    prices: WEB_PRICES[seller],
    inEeaOrUk: isEuCountry(country ?? undefined),
  });
  return (
    <div className="flex w-full justify-center bg-page px-4 pb-section pt-4 text-ink lg:pt-8">
      <HideSiteChrome />
      <HideSiteFinalCta />
      <div className="flex w-full max-w-[560px] flex-col gap-6">
        <Suspense fallback={<p className="text-center text-body text-ink-secondary">Loading…</p>}>
          <Checkout country={country} refundWindow={refundWindow} />
        </Suspense>
      </div>
    </div>
  );
}
