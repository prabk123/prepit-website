import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { HideSiteChrome } from "@/components/SiteChrome";
import { isEuCountry } from "@/lib/euCountries";
import { buildCartMarket } from "@/lib/funnel/cart";
import { COUNTRY_HEADER, parseCountryCode } from "@/lib/markets";
import { WEB_PRICES } from "@/lib/pricing";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";
import StartBridge from "./StartBridge";

export const metadata: Metadata = {
  title: "Start your free 7-day consultation",
  description: "Start your free 7-day consultation. Sign in with Apple or Google, choose your plan, then get PrepIt on your iPhone.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * The shared bridge (PRE-323): the landing page and the quiz both send people
 * here (`/start?from=landing|quiz&plan=&funnel=`, see lib/funnel/bridgeHandoff.ts).
 * Before sign-in it's the cart (PRE-437), with the prices of the company that
 * bills this visitor, read here on the server. Then RevenueCat's paywall, then
 * the "You're in" page.
 */
export default async function StartPage() {
  const country = parseCountryCode((await headers()).get(COUNTRY_HEADER));
  const seller = webBillingSellerFor(country);
  const market = buildCartMarket({
    country,
    seller,
    prices: WEB_PRICES[seller],
    inEeaOrUk: isEuCountry(country ?? undefined),
  });
  return (
    <div className="flex w-full justify-center bg-page px-4 pb-section pt-4 text-ink lg:pt-8">
      <HideSiteChrome />
      <HideSiteFinalCta />
      <div className="flex w-full max-w-[1040px] flex-col gap-6">
        <Suspense fallback={<p className="text-body text-ink-secondary">Loading…</p>}>
          <StartBridge country={country} market={market} />
        </Suspense>
      </div>
    </div>
  );
}
