import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, FORM_RATE_LIMIT, rateLimitKey, type RateLimiter } from "@/lib/rateLimit";
import { visitorIp } from "@/lib/visitorIp";

type Form = "contact" | "waitlist";

const limiters = {
  contact: createRateLimiter(FORM_RATE_LIMIT),
  waitlist: createRateLimiter(FORM_RATE_LIMIT),
} satisfies Record<Form, RateLimiter>;

/**
 * Wraps a form route so a visitor IP that posts too often gets 429 with
 * Retry-After (PRE-381). Each form has its own count. A post that fails on our
 * side (5xx, such as Slack being down) gives its hit back, so a visitor who
 * retries through an outage isn't locked out. A request with no usable IP
 * isn't limited here; the Firewall rule still applies. Only the form name is
 * logged, never the IP.
 */
export function withFormRateLimit(form: Form, handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const key = rateLimitKey(visitorIp(request));
    if (!key) return handler(request);

    const result = limiters[form](key);
    if (!result.allowed) {
      console.warn(`Form rate limited: ${form}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
      );
    }

    const response = await handler(request);
    if (response.status >= 500) result.refund();
    return response;
  };
}
