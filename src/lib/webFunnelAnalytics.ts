import { withPostHog } from "@/lib/posthogClient";

/**
 * Web2App funnel events (sign-in, checkout, account). Properties are fixed
 * ids and codes only (funnel id, plan, provider, reason codes); never names,
 * emails or anything a visitor typed. The person is identified by their
 * Firebase uid, the same distinct id the app and backend use.
 */
export const WEB_FUNNEL_EVENTS = {
  bridgeView: "web_bridge_view",
  signInStart: "web_signin_start",
  signupSuccess: "web_signup_success",
  signInFailed: "web_signin_failed",
} as const;

type WebFunnelEvent = (typeof WEB_FUNNEL_EVENTS)[keyof typeof WEB_FUNNEL_EVENTS];

export function trackWebFunnelEvent(
  event: WebFunnelEvent,
  properties: Record<string, string | number | boolean | null> = {},
) {
  withPostHog((posthog) => posthog.capture(event, { source: "website", ...properties }));
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
