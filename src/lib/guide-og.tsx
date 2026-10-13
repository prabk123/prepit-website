import { guideSectionTitle, loadGuide } from "@/lib/guides";
import { ogCardSize, renderOgCard } from "@/lib/og-card";

export const guideOgSize = ogCardSize;
export const guideOgAlt = "A PrepIt guide";

/**
 * A guide's link preview: the PrepIt mark, the guide's section, title and
 * summary. With no slug, the preview for the guides index.
 */
export async function renderGuideOg(slug: string | null) {
  const guide = slug ? await loadGuide(slug) : null;
  return renderOgCard({
    eyebrow: guide ? `Guide · ${guideSectionTitle(guide.meta.section)}` : "Guides",
    title: guide?.meta.title ?? "Get more from your nutritionist.",
    summary: guide?.meta.summary ?? "Short, step-by-step guides to getting the most out of PrepIt.",
  });
}
