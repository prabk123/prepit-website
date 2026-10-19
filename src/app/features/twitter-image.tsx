import { ogCardSize, renderOgCard } from "@/lib/og-card";

export const alt = "PrepIt features";
export const size = ogCardSize;
export const contentType = "image/png";

/** The Features overview preview: the site card with the page's headline and the phone from its first hero, the nutritionist. */
export default async function Image() {
  return renderOgCard({
    eyebrow: "Features",
    title: "Everything your nutritionist does.",
    summary: "It learns how you eat, speaks up when something slips, plans your week and keeps logging quick.",
    phone: "ai-nutritionist",
  });
}
