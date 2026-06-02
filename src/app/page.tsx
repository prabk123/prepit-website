import type { Metadata } from "next";
import Image from "next/image";
import LoggingSection from "@/components/LoggingSection";
import NlLogBottomSheetDemo from "@/components/NlLogBottomSheetDemo";
import NutritionLoopSection from "@/components/NutritionLoopSection";
import AiCoachSection from "@/components/AiCoachSection";
import GoalsSection from "@/components/GoalsSection";
import FaqSection from "@/components/FaqSection";
import NutritionSignalsSection from "@/components/NutritionSignalsSection";
import ObjectionMirrorSection from "@/components/ObjectionMirrorSection";
import TrustAccuracySection from "@/components/TrustAccuracySection";

export const metadata: Metadata = {
  title: "PrepIt - AI-Powered Meal Planning & Nutrition Tracking",
  description:
    "Plan smarter, eat better, stress less. Get personalized AI-powered meal plans, track nutrition, scan meals with your camera, and discover thousands of recipes tailored to your goals and lifestyle.",
  alternates: {
    canonical: "https://www.tryprepit.app",
  },
  openGraph: {
    title: "PrepIt - AI-Powered Meal Planning & Nutrition Tracking",
    description:
      "Plan smarter, eat better, stress less. Get personalized AI-powered meal plans, track nutrition, and discover thousands of recipes.",
    url: "https://www.tryprepit.app",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrepIt App - Meal Planning and Nutrition Tracking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepIt - AI-Powered Meal Planning & Nutrition Tracking",
    description:
      "Plan smarter, eat better, stress less. Get personalized AI-powered meal plans, track nutrition, and discover thousands of recipes.",
    images: ["/og-image.png"],
  },
};

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
                Your AI nutritionist
              </p>

              {/* Heading + description */}
              <div className="flex flex-col gap-6">
                <h1
                  className="text-[40px] font-semibold leading-tight tracking-tight lg:text-[64px] lg:leading-[64px]"
                  style={{ fontFamily: "var(--font-brand)" }}
                >
                  Your meals in.{" "}
                  <br />
                  Smart nutrition advice out.
                </h1>

                <p className="text-base font-normal leading-relaxed text-[var(--black-100)] lg:text-lg lg:leading-[27px]">
                  Describe any meal in your own words. PrepIt logs it in
                  seconds, shows how it&apos;ll affect your energy, hunger, and
                  mood, and tells you what to do next. No food hunts. No guilt.
                  Just a coach that fits how you actually eat.
                </p>
              </div>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-row justify-start items-start gap-4">
              <a
                href="https://apps.apple.com/app/prepit-ai-nutritionist/id6751211023"
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
              </a>
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
                <NlLogBottomSheetDemo overlay />
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

      <GoalsSection />

      <FaqSection />
    </>
  );
}
