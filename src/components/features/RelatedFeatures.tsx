import FeatureTiles from "@/components/features/FeatureTiles";
import { V9Section } from "@/components/landing/v9/V9Sections";
import { relatedFeatures, type FeatureSlug } from "@/lib/features";

/** "More of what it does.": a photo tile for each other feature page (PRE-450). */
export default function RelatedFeatures({ slug }: { slug: FeatureSlug }) {
  return (
    <V9Section id="related-features" name="related-features" labelledBy="related-features-heading" band>
      <div className="flex flex-col gap-8">
        <h2 id="related-features-heading" className="font-display text-section text-ink text-balance">
          More of what it does.
        </h2>
        <FeatureTiles slugs={relatedFeatures(slug).map((feature) => feature.slug)} layout="grid" />
      </div>
    </V9Section>
  );
}
