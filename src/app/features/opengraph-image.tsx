import { ogCardSize, renderOgCard } from "@/lib/og-card";

export const alt = "PrepIt features";
export const size = ogCardSize;
export const contentType = "image/png";

/** The Features overview preview: the site card with the page's headline and the nutritionist's chart. */
export default async function Image() {
  return renderOgCard({
    eyebrow: "Features",
    title: "Everything your nutritionist does.",
    summary: "It learns how you eat, speaks up when something slips, plans your week and keeps logging quick.",
    thumb: "02-chat-chart",
  });
}
