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
