import type { Metadata } from "next";
import { headers } from "next/headers";
import { HideSiteChrome } from "@/components/SiteChrome";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { COUNTRY_HEADER, webMarketFor } from "@/lib/markets";
import { WEB_PRICES } from "@/lib/pricing";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";
import Quiz from "./Quiz";
import "../v9-cream.css";
import "./quiz-v9.css";

export const metadata: Metadata = {
  title: "Your first week with an AI nutritionist",
  description: "Answer a few quick questions and see what your first week with PrepIt's AI nutritionist would focus on.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * The web quiz (PRE-322): an app-like page of its own, without the site's
 * header and footer. The country comes from Vercel's geo header, for the
 * units and helplines (PRE-441); it defaults to US. The market (from the
 * proxy, which honours the preview
 * `?country=` pin) picks where the quiz hands off once its loader ends: the
 * cart where the website sells (PRE-446), as on the landing page (PRE-331).
 * The currency is checkout's (PRE-373), for the completion event.
 */
export default async function QuizPage() {
  const requestHeaders = await headers();
  const country = requestHeaders.get("x-vercel-ip-country")?.toUpperCase();
  const pinnedCountry = requestHeaders.get(COUNTRY_HEADER);
  const market = webMarketFor(pinnedCountry);
  return (
    <>
      <HideSiteChrome />
      <HideSiteFinalCta />
      <Quiz country={country && /^[A-Z]{2}$/.test(country) ? country : "US"} market={market} prices={WEB_PRICES[webBillingSellerFor(pinnedCountry)]} />
    </>
  );
}
