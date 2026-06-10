import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_MAX_AGE_ONE_YEAR,
  PREPIT_GEO_COOKIE,
} from "@/lib/cookies";
import { isEuCountry, resolveCountryCode } from "@/lib/geo";

export function middleware(request: NextRequest) {
  const country = resolveCountryCode(request);
  const geoRegion = isEuCountry(country) ? "eu" : "non-eu";
  const response = NextResponse.next();
  const existing = request.cookies.get(PREPIT_GEO_COOKIE)?.value;

  if (existing !== geoRegion) {
    response.cookies.set(PREPIT_GEO_COOKIE, geoRegion, {
      path: "/",
      maxAge: COOKIE_MAX_AGE_ONE_YEAR,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
