import type { ComponentProps, ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type DeviceFrame from "@/components/device/DeviceFrame";
import FeatureHero from "@/components/features/FeatureHero";
import LoggingFeature from "@/components/features/pages/LoggingFeature";
import MealPlansFeature from "@/components/features/pages/MealPlansFeature";
import NutritionistFeature from "@/components/features/pages/NutritionistFeature";
import SignalsFeature from "@/components/features/pages/SignalsFeature";
import WidgetsFeature from "@/components/features/pages/WidgetsFeature";
import RelatedFeatures from "@/components/features/RelatedFeatures";
import FinalCta from "@/components/pricing/FinalCta";
import { appCapture, appVideo } from "@/lib/captures";
import { FEATURES, FEATURE_SLUGS, featureHref, isFeatureSlug, type FeatureSlug } from "@/lib/features";

const baseUrl = "https://www.tryprepit.app";

type HeroMedia = Pick<ComponentProps<typeof DeviceFrame>, "capture" | "video">;

/** Each page's sections, and the phone in its header. */
const PAGES: Record<FeatureSlug, { Body: ComponentType; hero: HeroMedia }> = {
  logging: {
    Body: LoggingFeature,
    hero: {
      video: appVideo("03-log-typed", "Typing a meal in plain words and PrepIt building the log with its macros"),
    },
  },
  "nutrition-signals": {
    Body: SignalsFeature,
    hero: {
      capture: appCapture(
        "06-signal-energy",
        "Energy at 84, with what shaped it: calorie fit, meal spread and timing",
      ),
    },
  },
  "ai-nutritionist": {
    Body: NutritionistFeature,
    hero: {
      video: appVideo(
        "08-chat-ask",
        "Asking the nutritionist for a high-protein breakfast for tomorrow and getting its reply",
      ),
    },
  },
  "meal-plans": {
    Body: MealPlansFeature,
    hero: { video: appVideo("12-plan-week", "Scrolling a week of planned meals, each with a photo of the dish") },
  },
  "widgets-and-siri": {
    Body: WidgetsFeature,
    hero: {
      capture: appCapture(
        "23b-home-screen-widgets",
        "An iPhone Home Screen with PrepIt's Today's calories widget: 1,485 kcal eaten, 85 left of a 1,570 goal, On track",
      ),
    },
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isFeatureSlug(slug)) return {};
  const { title, description } = FEATURES[slug];
  const url = `${baseUrl}${featureHref(slug)}`;
  // Page-level openGraph and twitter replace the root layout's, so the site
  // name is repeated here. The images come from opengraph-image.tsx.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${title} | PrepIt`,
      description,
      siteName: "PrepIt",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: `${title} | PrepIt`, description },
  };
}

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params;
  if (!isFeatureSlug(slug)) notFound();
  const feature = FEATURES[slug];
  const { Body, hero } = PAGES[slug];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: feature.title,
    description: feature.description,
    url: `${baseUrl}${featureHref(slug)}`,
    image: `${baseUrl}${featureHref(slug)}/opengraph-image`,
    about: { "@type": "MobileApplication", name: "PrepIt", operatingSystem: "iOS" },
    publisher: { "@type": "Organization", name: "PrepIt", logo: `${baseUrl}/logo.png` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FeatureHero feature={feature} media={hero} />
      <Body />
      <RelatedFeatures slug={slug} />
      {/* Feature pages end with their own download section, so App Store taps are counted per page. */}
      <FinalCta trackingSource={`feature-${slug}`} />
    </>
  );
}
