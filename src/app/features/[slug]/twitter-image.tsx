import { notFound } from "next/navigation";
import { featureOgAlt, featureOgSize, renderFeatureOg } from "@/lib/feature-og";
import { FEATURE_SLUGS, isFeatureSlug } from "@/lib/features";

export const alt = featureOgAlt;
export const size = featureOgSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isFeatureSlug(slug)) notFound();
  return renderFeatureOg(slug);
}
