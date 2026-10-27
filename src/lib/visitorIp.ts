import { ipAddress } from "@vercel/functions";
import { cleanIpAddress } from "@/lib/metaMatching";

/** The visitor's IP as Vercel reports it (x-forwarded-for off Vercel), or undefined when it isn't a valid address. */
export function visitorIp(request: Request): string | undefined {
  return cleanIpAddress(ipAddress(request) ?? request.headers.get("x-forwarded-for")?.split(",")[0]);
}
