import type { Metadata } from "next";
import { headers } from "next/headers";
import SectionViewTracker from "@/components/analytics/SectionViewTracker";
import LandingFaq from "@/components/landing/LandingFaq";
import {
  ClosingSection,
  FreeWeekSection,
  JustAskSection,
  LandingHero,
  LoggingSection,
  OfferSection,
  PlansSection,
  SignalsSection,
  TrustSection,
  WeKnowSection,
  WhyItWorksSection,
} from "@/components/landing/LandingSections";
import LandingViewTracker from "@/components/landing/LandingViewTracker";
import StickyCta from "@/components/landing/StickyCta";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { COUNTRY_HEADER, webMarketFor } from "@/lib/markets";
import { PRICES, TRIAL_DAYS, WEB_PRICES } from "@/lib/pricing";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";

const TITLE = "PrepIt | Eat healthier, one change at a time";
const DESCRIPTION = `Tell your AI nutritionist what you eat. It finds the one thing to change first and plans your week. ${TRIAL_DAYS} days free, with a nutrition consultation.`;

// An ad landing page: kept out of search, so it doesn't compete with the homepage.
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://www.tryprepit.app/try" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

/**
 * The direct-sale landing page (PRE-302), to the landing design: no quiz.
 * Visitors start their free week on the website (sign in, pay $0, then
 * download the app). That is every country for now; a country listed in
 * lib/markets.ts goes to the App Store or the waitlist instead (PRE-331).
 * The proxy passes the country, which also picks the currency of the prices:
 * the one checkout charges, or US dollars for the App Store (PRE-373).
 */
export default async function LandingPage() {
  const country = (await headers()).get(COUNTRY_HEADER);
  const market = webMarketFor(country);
  const prices = market === "web" ? WEB_PRICES[webBillingSellerFor(country)] : PRICES;

  return (
    <div className="bg-page text-ink">
      <HideSiteFinalCta />
      <SectionViewTracker />
      <LandingViewTracker market={market} priceCurrency={prices.currency} />
      <LandingHero market={market} prices={prices} />
      <FreeWeekSection market={market} />
      <WhyItWorksSection />
      <SignalsSection />
      <PlansSection market={market} />
      <LoggingSection />
      <JustAskSection />
      <TrustSection market={market} />
      <WeKnowSection market={market} prices={prices} />
      <OfferSection market={market} prices={prices} />
      <LandingFaq market={market} prices={prices} />
      <ClosingSection market={market} prices={prices} />
      <StickyCta market={market} prices={prices} />
    </div>
  );
}
