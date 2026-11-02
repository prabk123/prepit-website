import type { Metadata } from "next";
import { headers } from "next/headers";
import { HideSiteChrome } from "@/components/SiteChrome";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { COUNTRY_HEADER, webMarketFor } from "@/lib/markets";
import { WEB_PRICES } from "@/lib/pricing";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";
import Quiz from "./Quiz";

export const metadata: Metadata = {
  title: "Your first week with an AI nutritionist",
  description: "Answer a few quick questions and see what your first week with PrepIt's AI nutritionist would focus on.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * The web quiz (PRE-322): an app-like page of its own, without the site's
 * header and footer. The market (from the proxy, which honours the preview
 * `?country=` pin) picks where the quiz hands off once its loader ends: the
 * cart where the website sells (PRE-446), as on the landing page (PRE-331).
 * The currency is checkout's (PRE-373), for the completion event.
 */
export default async function QuizPage() {
  const pinnedCountry = (await headers()).get(COUNTRY_HEADER);
  const market = webMarketFor(pinnedCountry);
  return (
    <>
      <HideSiteChrome />
      <HideSiteFinalCta />
      <Quiz market={market} prices={WEB_PRICES[webBillingSellerFor(pinnedCountry)]} />
    </>
  );
}
