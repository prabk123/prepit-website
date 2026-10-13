import LinkCard from "@/components/ui/LinkCard";
import Section from "@/components/ui/Section";
import { featureHref, relatedFeatures, type FeatureSlug } from "@/lib/features";

/** "More of what PrepIt does": a card for each other feature page. */
export default function RelatedFeatures({ slug }: { slug: FeatureSlug }) {
  return (
    <Section labelledBy="related-features-heading">
      <div className="flex flex-col gap-8">
        <h2 id="related-features-heading" className="font-display text-title text-ink">
          More of what PrepIt does
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {relatedFeatures(slug).map((feature) => (
            <LinkCard
              key={feature.slug}
              href={featureHref(feature.slug)}
              title={feature.name}
              summary={feature.summary}
              action="See how it works"
              thumb={{
                avif: `/app/${feature.thumb}-dark@1x.avif`,
                webp: `/app/${feature.thumb}-dark@1x.webp`,
              }}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
