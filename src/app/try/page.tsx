import type { Metadata } from "next";
import { headers } from "next/headers";
import SectionViewTracker from "@/components/analytics/SectionViewTracker";
import LandingFaq from "@/components/landing/LandingFaq";
import { ClosingSection, OfferSection, TrustSection } from "@/components/landing/LandingSections";
import LandingViewTracker from "@/components/landing/LandingViewTracker";
import StickyCta from "@/components/landing/StickyCta";
import "@/components/landing/v9/landing-v9.css";
import {
  AskNutritionistSection,
  HoweverYouEatSection,
  ItNoticesSection,
  ItPlansSection,
  SayItSection,
  SeeItSection,
  StartMondaySection,
  V9Hero,
  WhoItsForSection,
} from "@/components/landing/v9/V9Sections";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { COUNTRY_HEADER, webMarketFor } from "@/lib/markets";
import { PRICES, TRIAL_DAYS, WEB_PRICES } from "@/lib/pricing";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";

const TITLE = "PrepIt | The nutritionist for everyone";
const DESCRIPTION = `Your AI nutritionist learns your meals, spots the pattern and plans your week. ${TRIAL_DAYS} days free, with a nutrition consultation.`;

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
 * The direct-sale landing page (PRE-302): Landing v9 from the hero film to
 * Ask Nutritionist (PRE-432), then the earlier trust, offer, FAQ and closing
 * sections until part 2 (PRE-433) replaces them. No quiz.
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
    <div className="landing-v9 bg-page text-ink">
      <HideSiteFinalCta />
      <SectionViewTracker />
      <LandingViewTracker market={market} priceCurrency={prices.currency} />
      <V9Hero market={market} prices={prices} />
      <HoweverYouEatSection />
      <WhoItsForSection />
      <StartMondaySection />
      <SayItSection />
      <SeeItSection />
      <ItNoticesSection />
      <ItPlansSection market={market} />
      <AskNutritionistSection />
      <TrustSection market={market} />
      <OfferSection market={market} prices={prices} />
      <LandingFaq market={market} prices={prices} />
      <ClosingSection market={market} prices={prices} />
      {/* The handoff footer's media note, until PRE-433 rebuilds the footer. */}
      <p className="mx-auto w-full max-w-content px-gutter pb-2 pt-8 text-[13px] leading-snug text-ink-muted">
        App screens are real, from an example account. Photos are illustrative, and some are AI-generated.
      </p>
      <StickyCta market={market} prices={prices} />
    </div>
  );
}
