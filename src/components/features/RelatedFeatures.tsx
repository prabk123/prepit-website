import LinkCard from "@/components/ui/LinkCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { cardThumb } from "@/lib/captures";
import { featureHref, relatedFeatures, type FeatureSlug } from "@/lib/features";

/**
 * "More of what PrepIt does": a card for each other feature page. On phones
 * each card is one short row, so the four take under a screen (PRE-318).
 */
export default function RelatedFeatures({ slug }: { slug: FeatureSlug }) {
  return (
    <Section labelledBy="related-features-heading">
      <div className="flex flex-col gap-8">
        <SectionHeading id="related-features-heading" size="title" title="More of what PrepIt does" />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {relatedFeatures(slug).map((feature) => (
            <LinkCard
              key={feature.slug}
              href={featureHref(feature.slug)}
              title={feature.name}
              summary={feature.summary}
              action="See how it works"
              thumb={cardThumb(feature.thumb)}
              compact
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
