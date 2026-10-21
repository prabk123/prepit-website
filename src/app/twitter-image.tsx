import { homeOgAlt, renderHomeOgCard } from "@/lib/home-og";
import { ogCardSize } from "@/lib/og-card";

export const alt = homeOgAlt;
export const size = ogCardSize;
export const contentType = "image/jpeg";

/**
 * The site's default link preview (PRE-312): the homepage hero. Every page
 * without its own preview image (home, research, contact, legal) uses it.
 */
export default async function Image() {
  return renderHomeOgCard();
}
