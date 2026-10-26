import type { NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";

export { isEuCountry } from "@/lib/euCountries";

export function resolveCountryCode(request: NextRequest): string | undefined {
  const forcedGeo = process.env.PREPIT_FORCE_GEO?.trim().toLowerCase();
  if (forcedGeo === "eu") return "DE";
  if (forcedGeo === "non-eu") return "US";

  const fromHelper = geolocation(request).country;
  if (fromHelper) return fromHelper;

  return request.headers.get("x-vercel-ip-country") ?? undefined;
}

/** The visitor's region inside their country (ISO 3166-2 suffix, like `QC`), from Vercel's geo-IP. */
export function resolveRegionCode(request: NextRequest): string | undefined {
  const fromHelper = geolocation(request).countryRegion;
  if (fromHelper) return fromHelper;

  return request.headers.get("x-vercel-ip-country-region") ?? undefined;
}
