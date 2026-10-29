import type { Metadata } from "next";
import DeviceFrame from "@/components/device/DeviceFrame";
import AppStoreCta from "@/components/ui/AppStoreCta";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { FEATURE_HERO_MEDIA } from "@/lib/featureHeroMedia";
import { FEATURE_SLUGS, FEATURES, featureHref } from "@/lib/features";
import { TRIAL_DAYS } from "@/lib/pricing";
import { RESEARCH_PAGE_HREF } from "@/lib/research";

const title = "Features";
const description =
  "Everything PrepIt's nutritionist does: it learns how you eat and speaks up, shows how your food will make you feel, plans your week and makes logging quick.";
const url = "https://www.tryprepit.app/features";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  // The preview image comes from ./opengraph-image.tsx.
  openGraph: { type: "website", url, title: `${title} | PrepIt`, description, siteName: "PrepIt", locale: "en_US" },
  twitter: { card: "summary_large_image", title: `${title} | PrepIt`, description },
};

/**
 * The Features overview (PRE-307), where the header's Features link goes. One
 * hero per feature, in site order (PRE-311): the same heading, line and phone
 * as the top of that feature's page, alternating sides and backgrounds down
 * the page, each linking through. On phones the phone is the smaller 220 px
 * size the research page and capture rows use, to keep five heroes short.
 * The site's closing download band follows from the layout, as on the
 * guides index.
 */
export default function FeaturesPage() {
  return (
    <>
      <Section labelledBy="features-heading">
        <div className="flex flex-col gap-8">
          <SectionHeading
            as="h1"
            intro
            id="features-heading"
            eyebrow="Features"
            title="Everything your nutritionist does."
            lead="It learns how you eat, speaks up when something slips, plans your week and keeps logging quick."
          />
          <AppStoreCta
            className="hero-rise [--rise-delay:600ms]"
            trackingSource="features-index-hero"
            note={`${TRIAL_DAYS} days free. Cancel anytime.`}
          />
          <TextLink href={RESEARCH_PAGE_HREF} className="hero-rise [--rise-delay:700ms]">
            How your nutritionist decides
          </TextLink>
        </div>
      </Section>
      {FEATURE_SLUGS.map((slug, index) => {
        const feature = FEATURES[slug];
        const headingId = `${slug}-heading`;
        return (
          <Section key={slug} id={slug} tone={index % 2 === 0 ? "surface" : "page"} labelledBy={headingId}>
            <FeatureSplit
              emphasis="text"
              reverse={index % 2 === 1}
              media={
                <div className="relative lg:py-4">
                  <Glow />
                  <DeviceFrame
                    className="[--device-w:220px] sm:[--device-w:300px] lg:[--device-w:340px]"
                    priority={index === 0}
                    {...FEATURE_HERO_MEDIA[slug]}
                  />
                </div>
              }
            >
              <SectionHeading
                id={headingId}
                eyebrow={feature.name}
                size="section"
                title={feature.heading}
                lead={feature.lead}
              />
              <TextLink href={featureHref(slug)}>{feature.overviewLink}</TextLink>
            </FeatureSplit>
          </Section>
        );
      })}
    </>
  );
}
