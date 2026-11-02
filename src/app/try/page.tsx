import type { Metadata } from "next";
import { headers } from "next/headers";
import SectionViewTracker from "@/components/analytics/SectionViewTracker";
import LandingViewTracker from "@/components/landing/LandingViewTracker";
import StickyCta from "@/components/landing/StickyCta";
import "@/app/v9-cream.css";
import "@/components/landing/v9/landing-v9.css";
import { ClosingSection, FaqSection, OfferSection, TrustSection, V9Footer } from "@/components/landing/v9/V9LowerSections";
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
 * The direct-sale landing page (PRE-302): Landing v9, from the hero film to
 * Ask Nutritionist (PRE-432), then why you can trust it, the offer, the FAQ,
 * the close and the landing's own footer (PRE-433). No quiz link yet.
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
      <TrustSection />
      <OfferSection market={market} prices={prices} />
      <FaqSection market={market} prices={prices} />
      <ClosingSection market={market} prices={prices} />
      <V9Footer />
      <StickyCta market={market} prices={prices} />
    </div>
  );
}
