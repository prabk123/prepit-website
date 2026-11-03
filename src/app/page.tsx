import type { Metadata } from "next";
import SectionViewTracker from "@/components/analytics/SectionViewTracker";
import { LandingSurfaceProvider } from "@/components/landing/LandingSurface";
import StickyCta from "@/components/landing/StickyCta";
import "@/app/v9-cream.css";
import "@/components/landing/v9/landing-v9.css";
import { ClosingSection, FaqSection, OfferSection, TrustSection, V9FinePrint } from "@/components/landing/v9/V9LowerSections";
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
import { HOME_DESCRIPTION, HOME_SHARE_DESCRIPTION, HOME_TITLE } from "@/lib/homeMetadata";
import { visitorOffer } from "@/lib/visitorOffer";

const SITE_URL = "https://www.tryprepit.app";

// Indexed, with the canonical URL. The preview image is the site default,
// ./opengraph-image.tsx and ./twitter-image.tsx (the v9 hero, PRE-444).
export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_SHARE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_SHARE_DESCRIPTION,
  },
};

/**
 * The homepage (PRE-444): Landing v9, the same sections as /try (PRE-432,
 * PRE-433), with what an ad page leaves out. The site header (Features,
 * Guides, Research and "Start my free 7 days") and the full site footer
 * instead of the landing's short one (its small print stays, above the
 * site footer). Buttons report
 * with a `home_` placement and start in the `home` funnel (LandingSurface).
 * The old homepage's anchors still land on the matching section: #nutritionist,
 * #consultation, #signals, #how-it-decides, #plans and #questions (#hero,
 * #pricing and #faq keep their ids).
 *
 * Like /try, the country the proxy passes picks the market and the currency.
 */
export default async function Home() {
  const { market, prices } = await visitorOffer();

  return (
    <LandingSurfaceProvider surface="home">
      <div className="landing-v9 bg-page text-ink">
        <HideSiteFinalCta />
        <SectionViewTracker />
        <V9Hero market={market} prices={prices} surface="home" />
        <HoweverYouEatSection />
        <WhoItsForSection />
        <StartMondaySection />
        <SayItSection />
        <SeeItSection aliases={["signals"]} />
        <ItNoticesSection aliases={["nutritionist"]} />
        <ItPlansSection market={market} aliases={["plans"]} />
        <AskNutritionistSection />
        <TrustSection aliases={["how-it-decides"]} />
        <OfferSection market={market} prices={prices} aliases={["consultation"]} />
        <FaqSection market={market} prices={prices} surface="home" aliases={["questions"]} />
        <ClosingSection market={market} prices={prices} />
        {/* The landing footer's small print; the site footer below carries the copyright. */}
        <div className="v9-band w-full border-t border-line">
          <div className="mx-auto w-full max-w-content px-gutter py-8">
            <V9FinePrint copyright={false} />
          </div>
        </div>
        <StickyCta market={market} prices={prices} />
      </div>
    </LandingSurfaceProvider>
  );
}
