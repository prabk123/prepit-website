import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_MAX_AGE_ONE_YEAR,
  PREPIT_GEO_COOKIE,
} from "@/lib/cookies";
import { LANDING_PATH } from "@/lib/funnel/landing";
import { isEuCountry, resolveCountryCode } from "@/lib/geo";
import {
  COUNTRY_COOKIE,
  COUNTRY_HEADER,
  COUNTRY_OVERRIDE_COOKIE,
  parseCountryCode,
  webMarketFor,
} from "@/lib/markets";

/**
 * Pages that sell on the web (PRE-331). Every country buys on the web for
 * now, so this only sends a country that lib/markets.ts lists for the App
 * Store or the waitlist back to the landing page or the waitlist.
 */
const WEB_CHECKOUT_PATHS = ["/checkout", "/start"];

export function proxy(request: NextRequest) {
  const isProduction = process.env.VERCEL_ENV === "production";
  // On previews and locally, `?country=XX` pins the country for this browser
  // so the US flow can be tested from anywhere. Production ignores it.
  const queryOverride = isProduction ? null : parseCountryCode(request.nextUrl.searchParams.get("country"));
  const cookieOverride = isProduction ? null : parseCountryCode(request.cookies.get(COUNTRY_OVERRIDE_COOKIE)?.value);
  const country = queryOverride ?? cookieOverride ?? parseCountryCode(resolveCountryCode(request));
  const market = webMarketFor(country);

  const path = request.nextUrl.pathname;
  const sellsHere = WEB_CHECKOUT_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  let response: NextResponse;
  if (sellsHere && market !== "web") {
    const target = request.nextUrl.clone();
    target.pathname = market === "waitlist" ? "/waitlist" : LANDING_PATH;
    target.search = "";
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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
