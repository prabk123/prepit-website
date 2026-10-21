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
  /** The quiz's answers were sent after sign-in (`account_created`, `not_created_reason`, and `status` when the save failed). */
  bridgeAnswersSaved: "web_bridge_answers_saved",
  /** The bridge couldn't read the account and showed "We couldn't start your free week" (`status`). */
  bridgeError: "web_bridge_error",
  /** An in-app browser (Instagram, Facebook…) visitor tapped Open in Safari or Copy link (`action`). */
  inAppBrowserEscape: "web_in_app_browser_escape",
  signInFailed: "web_signin_failed",
  paywallView: "web_paywall_view",
  checkoutStart: "web_checkout_start",
  /** Meta matching details given to RevenueCat on checkout, and again on purchase start if `_fbp` was missing (`trigger`, `has_fbp`, `has_fbc`, `has_email`, `identity_saved`, `ids_saved`, `browser_saved`). Never the values. */
  metaMatchingSent: "web_meta_matching_sent",
  checkoutSuccess: "web_checkout_success",
  checkoutFailed: "web_checkout_failed",
  /** Checkout couldn't be offered (`reason`: already_subscribed, no_paywall, not_configured…). */
  checkoutUnavailable: "web_checkout_unavailable",
  handoffView: "web_handoff_view",
  /** "Open PrepIt" on the success page, for people who already have the app. */
  handoffOpenApp: "web_handoff_open_app",
  /** A quiz screen was shown (`step_id`, `step_index`). Never an answer: stop screens are `stop-age` and `stop-safety`. */
  quizStepView: "web_quiz_step_view",
  /** The email gate saved its lead (`marketing_consent`, `saved`: false when the request failed). */
  quizLeadSaved: "web_quiz_lead_saved",
  /** "Start my free 7 days" on the quiz's plan page, on to the bridge. */
  quizStartTrial: "web_quiz_start_trial",
  /** The plan page an email links to (`found`). */
  leadPlanView: "web_lead_plan_view",
  /** The email preferences page (`action`: unsubscribe or delete). */
  leadPreferencesAction: "web_lead_preferences_action",
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
