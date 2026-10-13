import { guideOgAlt, guideOgSize, renderGuideOg } from "@/lib/guide-og";

export const alt = guideOgAlt;
export const size = guideOgSize;
export const contentType = "image/png";

/** The guides index preview: renderGuideOg's "PrepIt guides" card. */
export default async function Image() {
  return renderGuideOg(null);
}
