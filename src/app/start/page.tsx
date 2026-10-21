import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { HideSiteChrome } from "@/components/SiteChrome";
import { isEuCountry } from "@/lib/geo";
import { COUNTRY_HEADER, parseCountryCode } from "@/lib/markets";
import StartBridge from "./StartBridge";

export const metadata: Metadata = {
  title: "Start your free week",
  description: "Sign in with Google or Apple, choose your plan, then get PrepIt on your iPhone.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * The shared bridge (PRE-323): the landing page and the quiz both send people
 * here (`/start?from=landing|quiz&plan=&funnel=`, see lib/funnel/bridgeHandoff.ts).
 * Sign in, then RevenueCat's paywall, then the "You're in" page.
 */
export default async function StartPage() {
  const country = parseCountryCode((await headers()).get(COUNTRY_HEADER));
  return (
    <div className="flex w-full justify-center bg-page px-4 pb-section pt-4 text-ink lg:pt-8">
      <HideSiteChrome />
      <HideSiteFinalCta />
      <div className="flex w-full max-w-[560px] flex-col gap-6">
        <Suspense fallback={<p className="text-body text-ink-secondary">Loading…</p>}>
          <StartBridge country={country} askWithdrawalConsent={isEuCountry(country ?? undefined)} />
        </Suspense>
      </div>
    </div>
  );
}
