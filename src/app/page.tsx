import type { Metadata } from "next";
import SectionViewTracker from "@/components/analytics/SectionViewTracker";
import HomeHero from "@/components/home/HomeHero";
import KnowsYouSection from "@/components/home/KnowsYouSection";
import ObjectionsSection from "@/components/home/ObjectionsSection";
import PlansBand from "@/components/home/PlansBand";
import PlanSwapSection from "@/components/home/PlanSwapSection";
import ResearchSection from "@/components/home/ResearchSection";
import SignalsSection from "@/components/home/SignalsSection";
import SpeaksUpBand from "@/components/home/SpeaksUpBand";
import MotionLayer from "@/components/motion/MotionLayer";
import FaqSection from "@/components/pricing/FaqSection";
import PricingSection from "@/components/pricing/PricingSection";

const TITLE = "PrepIt | The nutritionist that notices";
const DESCRIPTION =
  "Tell PrepIt what you eat. It spots what's behind the 3pm slump and the evening snacking, and tells you the one thing to change first. 7 days free on iPhone.";
const SHARE_DESCRIPTION =
  "An AI nutritionist that learns how you eat, speaks up when something slips, and shows how your food will make you feel.";

// The preview image is the site default, ./opengraph-image.tsx (PRE-312).
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: "https://www.tryprepit.app",
  },
  openGraph: {
    title: TITLE,
    description: SHARE_DESCRIPTION,
    url: "https://www.tryprepit.app",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SHARE_DESCRIPTION,
  },
};

/**
 * The homepage (PRE-277, the light redesign): the promise, the two standouts
 * (the nutritionist that knows you and speaks up; how your food will make you
 * feel), the research band, your week planned, the questions people ask, then
 * price and FAQ. The closing download band is added by the layout.
 */
export default function Home() {
  return (
    <div className="bg-page text-ink">
      <SectionViewTracker />
      <MotionLayer />
      <HomeHero />
      <SpeaksUpBand />
      <KnowsYouSection />
      <SignalsSection />
      <ResearchSection />
      <PlansBand />
      <PlanSwapSection />
      <ObjectionsSection />
      <PricingSection />
      <FaqSection />
    </div>
  );
}
