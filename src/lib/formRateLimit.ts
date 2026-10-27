import { ipAddress } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";
import { cleanIpAddress } from "@/lib/metaMatching";
import { createRateLimiter, FORM_RATE_LIMIT, type RateLimiter } from "@/lib/rateLimit";

const limiters = new Map<string, RateLimiter>();

/**
 * Answers 429 when this visitor IP has posted a form too often (PRE-381), and
 * null when the submission can go ahead. Each form has its own count. Only
 * the form name is logged, never the IP.
 */
export function formRateLimitResponse(request: NextRequest, form: "contact" | "waitlist"): NextResponse | null {
  let limiter = limiters.get(form);
  if (!limiter) {
    limiter = createRateLimiter(FORM_RATE_LIMIT);
    limiters.set(form, limiter);
  }

  const ip = cleanIpAddress(ipAddress(request) ?? request.headers.get("x-forwarded-for")?.split(",")[0]) ?? "unknown";
  const result = limiter(ip);
  if (result.allowed) return null;

  console.warn(`Form rate limited: ${form}`);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
  );
}
