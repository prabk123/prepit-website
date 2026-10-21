import { isCardThumb } from "@/lib/captures";
import { guideSectionTitle, loadGuide } from "@/lib/guides";
import { ogCardSize, renderOgCard } from "@/lib/og-card";

export const guideOgSize = ogCardSize;
export const guideOgAlt = "A PrepIt guide";

/**
 * A guide's link preview: the PrepIt mark, the guide's section, title and
 * summary, beside the guide's card thumbnail. With no slug, the preview for
 * the guides index.
 */
export async function renderGuideOg(slug: string | null) {
  const guide = slug ? await loadGuide(slug) : null;
  // loadGuide has already checked the guide's thumbnail exists.
  const thumb = guide ? (guide.meta.thumb ?? guide.meta.hero) : "01-home";
  return renderOgCard({
    eyebrow: guide ? `Guide · ${guideSectionTitle(guide.meta.section)}` : "Guides",
    title: guide?.meta.title ?? "Get more from your nutritionist.",
    summary: guide?.meta.summary ?? "Short, step-by-step guides to getting the most out of PrepIt.",
    thumb: isCardThumb(thumb) ? thumb : "01-home",
  });
}
