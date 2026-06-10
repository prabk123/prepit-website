import type { NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";

/** EEA member states plus the UK (ISO 3166-1 alpha-2). */
const EU_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
  "GB",
]);

export function isEuCountry(countryCode: string | undefined): boolean {
  if (!countryCode) {
    // Unknown location: default to EU rules (show consent banner).
    return true;
  }

  return EU_COUNTRY_CODES.has(countryCode.toUpperCase());
}

export function resolveCountryCode(request: NextRequest): string | undefined {
  const forcedGeo = process.env.PREPIT_FORCE_GEO?.trim().toLowerCase();
  if (forcedGeo === "eu") return "DE";
  if (forcedGeo === "non-eu") return "US";

  const fromHelper = geolocation(request).country;
  if (fromHelper) return fromHelper;

  return request.headers.get("x-vercel-ip-country") ?? undefined;
}
