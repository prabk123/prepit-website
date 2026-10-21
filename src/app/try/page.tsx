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
import { TRIAL_DAYS } from "@/lib/pricing";

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
 * The proxy passes the country.
 */
export default async function LandingPage() {
  const market = webMarketFor((await headers()).get(COUNTRY_HEADER));

  return (
    <div className="bg-page text-ink">
      <HideSiteFinalCta />
      <SectionViewTracker />
      <LandingViewTracker market={market} />
      <LandingHero market={market} />
      <FreeWeekSection market={market} />
      <WhyItWorksSection />
      <SignalsSection />
      <PlansSection market={market} />
      <LoggingSection />
      <JustAskSection />
      <TrustSection market={market} />
      <WeKnowSection market={market} />
      <OfferSection market={market} />
      <LandingFaq market={market} />
      <ClosingSection market={market} />
      <StickyCta market={market} />
    </div>
  );
}
