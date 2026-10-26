import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_MAX_AGE_ONE_YEAR,
  PREPIT_GEO_COOKIE,
} from "@/lib/cookies";
import { LANDING_PATH } from "@/lib/funnel/landing";
import { isEuCountry, resolveCountryCode, resolveRegionCode } from "@/lib/geo";
import {
  COUNTRY_COOKIE,
  COUNTRY_HEADER,
  COUNTRY_OVERRIDE_COOKIE,
  parseCountryCode,
  parseRegionCode,
  REGION_OVERRIDE_COOKIE,
  waitlistRegionFor,
  webMarketFor,
} from "@/lib/markets";

/**
 * Pages that sell on the web (PRE-331): the bridge, the sign-in step before
 * paying, and checkout. Every country buys on the web for now, so this only
 * sends a country or region (Quebec, PRE-354) that lib/markets.ts lists for
 * the App Store or the waitlist back to the landing page or the waitlist.
 */
const WEB_CHECKOUT_PATHS = ["/checkout", "/start", "/signin"];

export function proxy(request: NextRequest) {
  const isProduction = process.env.VERCEL_ENV === "production";
  // On previews and locally, `?country=XX` pins the country for this browser
  // so the US flow can be tested from anywhere. Production ignores it.
  const queryOverride = isProduction ? null : parseCountryCode(request.nextUrl.searchParams.get("country"));
  const cookieOverride = isProduction ? null : parseCountryCode(request.cookies.get(COUNTRY_OVERRIDE_COOKIE)?.value);
  const country = queryOverride ?? cookieOverride ?? parseCountryCode(resolveCountryCode(request));
  // `?region=QC` pins the region the same way (preview and local only).
  const regionQuery = isProduction ? null : parseRegionCode(request.nextUrl.searchParams.get("region"));
  const regionCookie = isProduction ? null : parseRegionCode(request.cookies.get(REGION_OVERRIDE_COOKIE)?.value);
  const region = regionQuery ?? regionCookie ?? parseRegionCode(resolveRegionCode(request));
  const market = webMarketFor(country, region);

  const path = request.nextUrl.pathname;
  const sellsHere = WEB_CHECKOUT_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  let response: NextResponse;
  if (sellsHere && market !== "web") {
    const target = request.nextUrl.clone();
    target.pathname = market === "waitlist" ? "/waitlist" : LANDING_PATH;
    target.search = "";
    const blockedRegion = waitlistRegionFor(country, region);
    if (market === "waitlist" && blockedRegion) target.searchParams.set("region", blockedRegion);
    response = NextResponse.redirect(target);
  } else {
    const headers = new Headers(request.headers);
    headers.set(COUNTRY_HEADER, country ?? "");
    response = NextResponse.next({ request: { headers } });
  }

  const geoRegion = isEuCountry(country ?? undefined) ? "eu" : "non-eu";
  if (request.cookies.get(PREPIT_GEO_COOKIE)?.value !== geoRegion) {
    response.cookies.set(PREPIT_GEO_COOKIE, geoRegion, {
      path: "/",
      maxAge: COOKIE_MAX_AGE_ONE_YEAR,
      sameSite: "lax",
    });
  }
  // The country only, for analytics on funnel events. Not personal data.
  if (country && request.cookies.get(COUNTRY_COOKIE)?.value !== country) {
    response.cookies.set(COUNTRY_COOKIE, country, { path: "/", sameSite: "lax" });
  }
  if (queryOverride) {
    response.cookies.set(COUNTRY_OVERRIDE_COOKIE, queryOverride, { path: "/", sameSite: "lax" });
  }
  if (regionQuery) {
    response.cookies.set(REGION_OVERRIDE_COOKIE, regionQuery, { path: "/", sameSite: "lax" });
  }

  return response;
}

export const config = {
  // `__/` is Firebase's sign-in handler, proxied to Firebase (PRE-374): no
  // geo redirect or cookies there.
  matcher: [
    "/((?!_next/static|_next/image|__/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
