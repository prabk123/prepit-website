import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FeatureHero from "@/components/features/FeatureHero";
import LoggingFeature from "@/components/features/pages/LoggingFeature";
import MealPlansFeature from "@/components/features/pages/MealPlansFeature";
import NutritionistFeature from "@/components/features/pages/NutritionistFeature";
import SignalsFeature from "@/components/features/pages/SignalsFeature";
import WidgetsFeature from "@/components/features/pages/WidgetsFeature";
import RelatedFeatures from "@/components/features/RelatedFeatures";
import SiteClosing from "@/components/features/SiteClosing";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { FEATURES, FEATURE_SLUGS, featureHref, isFeatureSlug, type FeatureSlug } from "@/lib/features";
import { visitorOffer } from "@/lib/visitorOffer";

const baseUrl = "https://www.tryprepit.app";

/** Each page's sections. The still and card in its header are in FeatureHeroStage. */
const PAGES: Record<FeatureSlug, ComponentType> = {
  "ai-nutritionist": NutritionistFeature,
  "nutrition-signals": SignalsFeature,
  "meal-plans": MealPlansFeature,
  logging: LoggingFeature,
  "widgets-and-siri": WidgetsFeature,
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
  const Body = PAGES[slug];
  // The closing band's prices follow the visitor's market, as on the homepage.
  const { market, prices } = await visitorOffer();

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
      <FeatureHero feature={feature} market={market} prices={prices} />
      <Body />
      <RelatedFeatures slug={slug} />
      {/* Feature pages end with the homepage's close, so start taps are counted per page (placement feature-<slug>-closing). */}
      <SiteClosing market={market} prices={prices} placement={`feature-${slug}-closing`} />
      <HideSiteFinalCta />
    </>
  );
}
