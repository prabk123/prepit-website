import type { Metadata } from "next";
import Image from "next/image";
import AppStoreLink from "@/components/AppStoreLink";
import PrepItIcon, { type PrepItIconName } from "@/components/shareable/PrepItIcon";
import LoggingSection from "@/components/LoggingSection";
import HeroLoopDemo from "@/components/HeroLoopDemo";
import NutritionLoopSection from "@/components/NutritionLoopSection";
import AiCoachSection from "@/components/AiCoachSection";
import FaqSection from "@/components/FaqSection";
import NutritionSignalsSection from "@/components/NutritionSignalsSection";
import ObjectionMirrorSection from "@/components/ObjectionMirrorSection";
import TrustAccuracySection from "@/components/TrustAccuracySection";

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

const HERO_BULLETS: { text: string; icon: PrepItIconName }[] = [
  {
    text: "Log meals accurately in seconds in your own words",
    icon: "pencil",
  },
  {
    text: "Learn how your diet affects your energy, hunger and mood",
    icon: "charts",
  },
  {
    text: "Get personalised nutrition feedback, coaching and planning",
    icon: "sparkles",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="mt-16 flex w-full flex-col items-center bg-white px-4 pt-2 pb-10 lg:px-14 lg:py-20">
        <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-10 lg:flex-row lg:gap-14">
          {/* Left Content */}
          <div className="flex flex-1 flex-col gap-10">
            <div className="flex flex-col gap-4">
              {/* AI Nutritionist Gradient Text */}
              <p
                className="bg-clip-text text-[20px] font-semibold leading-normal text-transparent lg:text-[28px]"
                style={{
                  fontFamily: "var(--font-brand)",
                  WebkitTextFillColor: "transparent",
                  backgroundImage:
                    "linear-gradient(90deg, rgba(128, 159, 249, 1) 0%, rgba(208, 147, 217, 1) 27.913%, rgba(243, 140, 97, 1) 55.826%, rgba(245, 204, 119, 1) 93.043%)",
                  width: "fit-content",
                }}
              >
                Your personal AI nutritionist
              </p>

              {/* Heading + description */}
              <div className="flex flex-col gap-6">
                <h1
                  className="text-[40px] font-semibold leading-tight tracking-tight lg:text-[64px] lg:leading-[64px]"
                  style={{ fontFamily: "var(--font-brand)" }}
                >
                  Not just tracking.{" "}
                  <br />
                  A system that actually improves how you eat.
                </h1>

                <ul className="flex flex-col gap-4">
                  {HERO_BULLETS.map(({ text, icon }) => (
                    <li key={text} className="flex items-center gap-3 text-left">
                      <div className="ai-icon-chrome shrink-0" aria-hidden>
                        <div className="ai-icon-chrome__inner">
                          <PrepItIcon name={icon} size={20} color="var(--black-100)" />
                        </div>
                      </div>
                      <p className="min-w-0 flex-1 text-base font-normal leading-relaxed text-[var(--black-100)] lg:text-lg lg:leading-[27px]">
                        {text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-row justify-start items-start gap-4">
              <AppStoreLink
                trackingSource="hero"
                className="transition-opacity hover:opacity-80"
                aria-label="Download on the App Store"
              >
                <Image
                  src="/app_store_download.png"
                  alt="Download on the App Store"
                  width={160}
                  height={48}
                  className="h-12 w-auto"
                />
              </AppStoreLink>
              <div className="flex flex-col items-center justify-center gap-1">
                <Image
                  src="/play_store_download_disabled.png"
                  alt="Get it on Google Play"
                  width={160}
                  height={48}
                  className="h-12 w-auto opacity-50"
                />
                <span className="text-sm text-[var(--grey-60)] pt-2">
                  Coming soon 🕒
                </span>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup — image is 776×1276; mobile shows top 75% */}
          <div className="relative w-full min-w-0 flex-1 lg:max-w-[420px]">
            <div className="relative mx-auto w-full overflow-hidden max-lg:aspect-[776/957] lg:aspect-[776/1276]">
              <Image
                src="/hero_image.png"
                alt="PrepIt App Preview"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-[7%] bottom-[5%] z-10">
                <HeroLoopDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ObjectionMirrorSection />

      <NutritionLoopSection />

      <LoggingSection />

      <NutritionSignalsSection />

      <AiCoachSection />

      <TrustAccuracySection />

      <FaqSection />
    </>
  );
}
