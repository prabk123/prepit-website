import type { Metadata } from "next";
import LinkCard from "@/components/ui/LinkCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { cardThumb } from "@/lib/captures";
import { FEATURE_SLUGS, FEATURES, featureHref } from "@/lib/features";
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

/** The two standouts, as on the homepage, get the wider cards. */
const STANDOUTS = 2;

/**
 * The Features overview (PRE-307), where the header's Features link goes: a
 * card for each feature page, in site order. The site's closing download band
 * follows from the layout, as on the guides index.
 */
export default function FeaturesPage() {
  return (
    <Section labelledBy="features-heading">
      <div className="flex flex-col gap-stack">
        <SectionHeading
          as="h1"
          id="features-heading"
          eyebrow="Features"
          title="Everything your nutritionist does."
          lead="It learns how you eat, speaks up when something slips, plans your week and keeps logging quick. Pick one to see how it works."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {FEATURE_SLUGS.map((slug, index) => {
            const feature = FEATURES[slug];
            return (
              <li
                key={slug}
                className={`flex min-w-0 [&>a]:flex-1 ${index < STANDOUTS ? "lg:col-span-3" : "lg:col-span-2"}`}
              >
                <LinkCard
                  href={featureHref(slug)}
                  title={feature.name}
                  summary={feature.summary}
                  action="See how it works"
                  thumb={cardThumb(feature.thumb)}
                  headingLevel="h2"
                />
              </li>
            );
          })}
        </ul>
        <TextLink href={RESEARCH_PAGE_HREF}>How your nutritionist decides</TextLink>
      </div>
    </Section>
  );
}
