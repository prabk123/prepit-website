import "server-only";
import type { AppStoreRating } from "@/lib/funnel/paywallVariables";

const BUNDLE_ID = "app.tryprepit.app";
const DAY_SECONDS = 24 * 60 * 60;

/** The App Store storefront for a visitor: their country when we know it, else the UK store. */
export function storefrontFor(country: string | null | undefined): string {
  const code = country?.trim().toLowerCase();
  return code && /^[a-z]{2}$/.test(code) ? code : "gb";
}

/**
 * PrepIt's App Store rating in one storefront, from Apple's public lookup,
 * cached for a day (PRE-462). Null when Apple doesn't answer or has no rating;
 * the paywall's rating line is then hidden, never invented.
 */
export async function appStoreRating(country: string | null | undefined): Promise<AppStoreRating | null> {
  const storefront = storefrontFor(country);
  try {
    const response = await fetch(
      `https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}&country=${storefront}`,
      { next: { revalidate: DAY_SECONDS }, signal: AbortSignal.timeout(2_000) },
    );
    if (!response.ok) return null;
    const body = (await response.json()) as {
      results?: { averageUserRating?: unknown; userRatingCount?: unknown }[];
    };
    const app = body.results?.[0];
    const average = Number(app?.averageUserRating);
    const count = Number(app?.userRatingCount);
    if (!Number.isFinite(average) || !Number.isFinite(count)) return null;
    return { average, count, storefront };
  } catch {
    return null;
  }
}
