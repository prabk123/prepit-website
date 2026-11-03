import { ogCardSize, renderOgCard } from "@/lib/og-card";

export const alt = "PrepIt features";
export const size = ogCardSize;
export const contentType = "image/png";

/** The Features overview preview: the site card with the page's headline and the phone from its first hero, the nutritionist. */
export default async function Image() {
  return renderOgCard({
    eyebrow: "Features",
    title: "You say what you ate. It does the rest.",
    summary: "It logs the meal, tells you how it will make you feel, spots the pattern you'd miss and plans your week.",
    phone: "ai-nutritionist",
  });
}
