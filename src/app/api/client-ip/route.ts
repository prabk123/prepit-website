import { ipAddress } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";
import { cleanIpAddress } from "@/lib/metaMatching";

/**
 * The visitor's own IP address, which the browser can't read itself. Checkout
 * gives it to RevenueCat as `$ip` so its Meta integration can match a web
 * purchase (sendMetaMatchingToRevenueCat). It is only ever returned to the
 * same visitor, never stored or logged here.
 */
export function GET(request: NextRequest) {
  const ip = cleanIpAddress(ipAddress(request) ?? request.headers.get("x-forwarded-for")?.split(",")[0]);
  return NextResponse.json({ ip: ip ?? null }, { headers: { "Cache-Control": "private, no-store" } });
}
