import { renderHomeOgCard } from "@/lib/home-og";

// Prerendered at build, like the opengraph-image routes.
export const dynamic = "force-static";

/**
 * The old share image URL (PRE-312). public/og-image.png is gone, but apps that
 * cached the URL, and the About page until it is removed (PRE-311), still ask
 * for it, so it serves the site default image.
 */
export async function GET() {
  return renderHomeOgCard();
}
