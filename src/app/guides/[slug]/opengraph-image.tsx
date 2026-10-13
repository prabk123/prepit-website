import { getGuideSlugs } from "@/lib/guides";
import { guideOgAlt, guideOgSize, renderGuideOg } from "@/lib/guide-og";

export const alt = guideOgAlt;
export const size = guideOgSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return getGuideSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderGuideOg(slug);
}
