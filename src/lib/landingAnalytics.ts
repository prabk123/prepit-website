import { readCookie } from "@/lib/cookies";
import { attributionEventProperties } from "@/lib/funnel/attribution";
import { readAttribution } from "@/lib/funnel/attributionStore";
import { COUNTRY_COOKIE, parseCountryCode, webMarketFor, type WebMarket } from "@/lib/markets";
import { withPostHog, withPostHogBeforeLeaving } from "@/lib/posthogClient";

/**
 * Direct-sale landing page events (PRE-302, PRE-331). Same rules as the other
 * Web2App funnel events: fixed ids and codes only (funnel id, market, country
 * code, where the button sits, plan), plus the campaign the visitor landed
 * with. Never anything a visitor typed.
 */
export const LANDING_EVENTS = {
  /** Once per page view. */
  view: "web_landing_view",
  /** A "Start my free 7 days" (or waitlist) button. `placement`: hero, pricing, final. */
  ctaClick: "web_landing_cta_click",
  /** The waitlist form was sent (`result`: ok or error). No email in the event. */
  waitlistSubmit: "web_waitlist_submit",
} as const;

type LandingEvent = (typeof LANDING_EVENTS)[keyof typeof LANDING_EVENTS];

/** The visitor's country, from the cookie the proxy sets. */
export function visitorCountry(): string | null {
  return parseCountryCode(readCookie(COUNTRY_COOKIE));
}

/**
 * Registers `country` and `web_market` on every event this browser sends, so
 * the quiz, bridge and checkout events carry them too (PRE-331).
 */
export function registerVisitorMarket() {
  const country = visitorCountry();
  if (!country) return;
  withPostHog((posthog) => posthog.register({ country, web_market: webMarketFor(country) }));
}

function landingProperties(market: WebMarket, properties: Record<string, string | number | boolean | null>) {
  return {
    source: "website",
    ...attributionEventProperties(readAttribution()),
    country: visitorCountry(),
    web_market: market,
    ...properties,
  };
}

export function trackLandingEvent(
  event: LandingEvent,
  market: WebMarket,
  properties: Record<string, string | number | boolean | null> = {},
) {
  withPostHog((posthog) => posthog.capture(event, landingProperties(market, properties)));
}

/** For a tap that leaves the page: resolves once sent, or after half a second. */
export function trackLandingEventBeforeLeaving(
  event: LandingEvent,
  market: WebMarket,
  properties: Record<string, string | number | boolean | null> = {},
): Promise<void> {
  return withPostHogBeforeLeaving((posthog) =>
    posthog.capture(event, landingProperties(market, properties), { transport: "sendBeacon" }),
  );
}
