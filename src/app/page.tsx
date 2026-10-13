import type { Metadata } from "next";
import SectionViewTracker from "@/components/analytics/SectionViewTracker";
import AlwaysOnSection from "@/components/home/AlwaysOnSection";
import ConsultationSection from "@/components/home/ConsultationSection";
import EverythingElse from "@/components/home/EverythingElse";
import HomeHero from "@/components/home/HomeHero";
import LoggingSection from "@/components/home/LoggingSection";
import LoopSection from "@/components/home/LoopSection";
import NutritionistBand from "@/components/home/NutritionistBand";
import PlansBand from "@/components/home/PlansBand";
import ProofStrip from "@/components/home/ProofStrip";
import SignalsSection from "@/components/home/SignalsSection";
import TrustRow from "@/components/home/TrustRow";
import WhyTrackersFail from "@/components/home/WhyTrackersFail";
import FaqSection from "@/components/pricing/FaqSection";
import PricingSection from "@/components/pricing/PricingSection";

export const metadata: Metadata = {
  title: {
    absolute: "PrepIt | Your AI Nutritionist – Meals In, Smart Advice Out",
  },
  description:
    "Describe any meal in your own words. PrepIt logs it in seconds, shows how it affects your energy, hunger, and mood, and tells you what to do next—no food hunts, no guilt.",
  alternates: {
    canonical: "https://www.tryprepit.app",
  },
  openGraph: {
    title: "PrepIt | Your AI Nutritionist – Meals In, Smart Advice Out",
    description:
      "Log meals in plain English. PrepIt shows how each meal affects your energy, hunger, and mood—and what to do next.",
    url: "https://www.tryprepit.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrepIt – Your AI nutritionist app",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepIt | Your AI Nutritionist – Meals In, Smart Advice Out",
    description:
      "Log meals in plain English. PrepIt shows how each meal affects your energy, hunger, and mood—and what to do next.",
    images: ["/og-image.png"],
  },
};

/**
 * The homepage (design D3, copy approved 13 Oct). Pricing and FAQ come from
 * PRE-202; the closing download section is added by the layout.
 */
export default function Home() {
  return (
    <div className="bg-page text-ink">
      <SectionViewTracker />
      <HomeHero />
      <ProofStrip />
      <WhyTrackersFail />
      <AlwaysOnSection />
      <ConsultationSection />
      <LoopSection />
      <LoggingSection />
      <SignalsSection />
      <NutritionistBand />
      <PlansBand />
      <EverythingElse />
      <TrustRow />
      <PricingSection />
      <FaqSection />
    </div>
  );
}
