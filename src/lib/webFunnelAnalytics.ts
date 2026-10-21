import { attributionEventProperties } from "@/lib/funnel/attribution";
import { readAttribution } from "@/lib/funnel/attributionStore";
import { withPostHog } from "@/lib/posthogClient";

/**
 * Web2App funnel events (sign-in, checkout, account). Properties are fixed
 * ids and codes only (funnel id, plan, provider, reason codes); never names,
 * emails or anything a visitor typed. The person is identified by their
 * Firebase uid, the same distinct id the app and backend use. Each event also
 * carries the campaign the visitor landed with (`utm_source`, `utm_medium`,
 * `utm_campaign`), never ad click ids.
 */
export const WEB_FUNNEL_EVENTS = {
  bridgeView: "web_bridge_view",
  signInStart: "web_signin_start",
  signupSuccess: "web_signup_success",
  signInFailed: "web_signin_failed",
  paywallView: "web_paywall_view",
  checkoutStart: "web_checkout_start",
  checkoutSuccess: "web_checkout_success",
  checkoutFailed: "web_checkout_failed",
  /** Checkout couldn't be offered (`reason`: already_subscribed, no_paywall, not_configured…). */
  checkoutUnavailable: "web_checkout_unavailable",
  handoffView: "web_handoff_view",
  manageSubscriptionView: "web_manage_subscription_view",
  manageSubscriptionPortalOpen: "web_manage_subscription_portal_open",
} as const;

type WebFunnelEvent = (typeof WEB_FUNNEL_EVENTS)[keyof typeof WEB_FUNNEL_EVENTS];

export function trackWebFunnelEvent(
  event: WebFunnelEvent,
  properties: Record<string, string | number | boolean | null> = {},
) {
  const campaign = attributionEventProperties(readAttribution());
  withPostHog((posthog) => posthog.capture(event, { source: "website", ...campaign, ...properties }));
}

/**
 * Links this browser's anonymous PostHog id to the Firebase uid, so funnel
 * events before sign-in join the person's app events. No person properties.
 */
export function identifyWebUser(uid: string) {
  withPostHog((posthog) => {
    if (posthog.get_distinct_id() !== uid) posthog.identify(uid);
  });
}

/** After signing out, so the next person on this browser isn't merged in. */
export function resetWebUser() {
  withPostHog((posthog) => posthog.reset());
}
