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
  /**
   * The cart, `/start` before sign-in (PRE-437): `entry` (landing or quiz), `market` (the billing seller, us or uk),
   * `has_quiz_answers`, `in_app_browser`. Named as the web funnel v9 plan names it, for its dashboard (PRE-443).
   */
  cartView: "cart_view",
  /** "Not ready? Email me my plan" on the cart was opened (`entry`), PRE-439. */
  leaverEmailOpen: "leaver_email_open",
  /**
   * The cart's "Email me my plan" form was sent (`saved`: false when the request failed, `marketing_consent`,
   * `error_status`). Compare with `web_quiz_lead_saved`, the old email gate's capture (PRE-439).
   */
  leaverEmailSent: "leaver_email_sent",
  /** A sign-in button on the cart was pressed (`provider`, `from_sticky`). `web_signin_start` still fires too. */
  authStart: "auth_start",
  /** The Google or Apple popup came back signed in (`provider`, `from_sticky`), before the account is read. */
  authSuccess: "auth_success",
  /** The popup was closed before signing in (`provider`, `from_sticky`). `web_signin_cancelled` still fires too. */
  authCancel: "auth_cancel",
  /** Google or Apple sign-in started (`signup_method`, `auth_domain`: `prepit` when sign-in runs through tryprepit.app, `firebase` through firebaseapp.com, PRE-374). */
  signInStart: "web_signin_start",
  /** Signed in (`has_account`, `is_subscribed`…, and `auth_domain` as on `web_signin_start`). */
  signupSuccess: "web_signup_success",
  /** The quiz's answers were sent after sign-in (`account_created`, `not_created_reason`, and `status` when the save failed). */
  bridgeAnswersSaved: "web_bridge_answers_saved",
  /** The bridge couldn't read the account and showed "We couldn't start your free week" (`status`). */
  bridgeError: "web_bridge_error",
  /** An in-app browser (Instagram, Facebook…) visitor tapped Open in Safari or Copy link (`action`). */
  inAppBrowserEscape: "web_in_app_browser_escape",
  /** Sign-in failed (`signup_method`, `reason` code, and from the sign-in buttons `auth_domain` as on `web_signin_start`). */
  signInFailed: "web_signin_failed",
  /** The visitor closed the Google or Apple popup before signing in (`signup_method`, `auth_domain`). Also what a Google error page in the popup becomes, so watch it after an auth domain change (PRE-374). */
  signInCancelled: "web_signin_cancelled",
  /** The sign-in bridge asked RevenueCat about someone PrepIt's record doesn't show as subscribed (`result`: found, none, error, timeout or no_key; `has_account`). `found` shows "You already have PrepIt" instead of the plans. */
  bridgePremiumCheck: "web_bridge_premium_check",
  /**
   * RevenueCat's paywall was shown after sign-in (`plan`, `has_trial`, `trial_expected`…). The web funnel v9 plan
   * calls this `checkout_view`; the ticket kept the existing name (PRE-438). Likewise `purchase_success` is
   * `web_checkout_success`, `purchase_fail` is `web_checkout_failed`, `success_view` is `web_handoff_view` and
   * `app_store_click` is the App Store button's own event.
   */
  paywallView: "web_paywall_view",
  /**
   * The Welcome back step before the paywall (PRE-438): RevenueCat offers no free trial on this account, so they pay
   * today (`trial_expected`: whether PrepIt's record thought they'd get one, `has_prices`).
   */
  welcomeBackView: "welcome_back_view",
  /** "Continue to payment" on the Welcome back step. */
  welcomeBackContinue: "welcome_back_continue",
  checkoutStart: "web_checkout_start",
  /** Meta matching details given to RevenueCat on checkout, and again on purchase start if `_fbp` was missing (`trigger`, `has_fbp`, `has_fbc`, `has_email`, `identity_saved`, `ids_saved`, `browser_saved`). Never the values. */
  metaMatchingSent: "web_meta_matching_sent",
  checkoutSuccess: "web_checkout_success",
  /** `reason`: cancelled, already_purchased, declined (the bank refused the card, PRE-438), network, not_allowed, unknown, or paywall_load_failed. */
  checkoutFailed: "web_checkout_failed",
  /** Checkout couldn't be offered (`reason`: already_subscribed, no_paywall, not_configured…). */
  checkoutUnavailable: "web_checkout_unavailable",
  /** The "You're in" page (`provider`, `pending`, `from`, `trial`, and `member` when checkout found premium already on the account). */
  handoffView: "web_handoff_view",
  /** "Open PrepIt" on the success page, for people who already have the app. */
  handoffOpenApp: "web_handoff_open_app",
  /** "Email me the link" on the desktop "You're in" page (`provider`). A PostHog workflow sends the App Store link to the person's email (PRE-438). */
  emailLinkRequested: "email_link_requested",
  /** A quiz screen was shown (`step_id`, `step_index`). Never an answer: both stop screens (under 18, eating disorder) are `stop` with a null `step_index`. */
  quizStepView: "web_quiz_step_view",
  /** The email gate saved its lead (`marketing_consent`, `saved`: false when the request failed). */
  quizLeadSaved: "web_quiz_lead_saved",
  /** "Start my free 7 days" on the quiz's plan page, on to the bridge. */
  quizStartTrial: "web_quiz_start_trial",
  /** The plan page an email links to (`found`). */
  leadPlanView: "web_lead_plan_view",
  /** The email preferences page (`action`: unsubscribe or delete). */
  leadPreferencesAction: "web_lead_preferences_action",
  /** The account page (`via`: sign_in, or email_link with no other properties; signed in: `store`, `has_account`, `in_trial` and `will_renew` from RevenueCat, null when unknown). */
  manageSubscriptionView: "web_manage_subscription_view",
  /** Manage subscription tapped (`via`: sign_in or email_link; `outcome`: opened, no_web_subscription, invalid_link or error; `store` for email_link with no web subscription). */
  manageSubscriptionPortalOpen: "web_manage_subscription_portal_open",
  /** The withdraw-from-contract page once the status is known (`state`: eligible, withdrawn, expired, none, unavailable; `in_trial`). */
  withdrawalView: "web_contract_withdrawal_view",
  /** The confirm step was pressed (`outcome`: withdrawn, not_available, in_progress, error; `refunded`). */
  withdrawalConfirm: "web_contract_withdrawal_confirm",
  /** A withdraw-from-contract link was clicked (`placement`: footer or account). */
  withdrawalLinkClick: "web_contract_withdrawal_link_click",
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
