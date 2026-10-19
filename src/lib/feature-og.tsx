import { FEATURES, type FeatureSlug } from "@/lib/features";
import { ogCardSize, renderOgCard } from "@/lib/og-card";

export const featureOgSize = ogCardSize;
export const featureOgAlt = "A PrepIt feature";

/** A feature page's link preview: the PrepIt mark, the feature, its headline and one line, beside its card thumbnail. */
export function renderFeatureOg(slug: FeatureSlug) {
  const feature = FEATURES[slug];
  return renderOgCard({ eyebrow: feature.name, title: feature.heading, summary: feature.summary, thumb: feature.thumb });
}
