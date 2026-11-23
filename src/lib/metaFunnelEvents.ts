/**
 * Which web funnel events also go to the Meta Pixel as custom events
 * (PRE-569), and which of their properties. Kept free of React and path
 * aliases so the node tests can run it.
 *
 * Meta gets the same event name PostHog gets, through `fbq('trackCustom')`,
 * so audiences and custom conversions can use each funnel step. Meta's
 * standard events (PageView, Lead, CompleteRegistration, InitiateCheckout)
 * are sent as before and are not replaced.
 *
 * Purchases and trials reach Meta only from RevenueCat. `web_checkout_success`
 * is a custom event with no `value` or `currency`, so Meta can't read it as a
 * Purchase or count revenue from it.
 */

/**
 * The acquisition funnel, from the quiz to the "You're in" page. Left out on
 * purpose: the quiz's stop screens (`web_quiz_ended`, under 18 or an eating
 * disorder answer), the health and AI consent box, internal events such as
 * `web_meta_matching_sent`, the plan and email preference pages (a token in
 * the address), account, withdrawal, connector and privacy choices pages.
 */
export const META_FUNNEL_EVENTS: ReadonlySet<string> = new Set([
  "web_quiz_step_view",
  "quiz_completed",
  "cart_view",
  "leaver_email_open",
  "leaver_email_sent",
  "auth_start",
  "auth_success",
  "auth_cancel",
  "web_signin_start",
  "web_signin_failed",
  "web_signin_cancelled",
  "web_signup_success",
  "web_bridge_view",
  "web_bridge_answers_saved",
  "web_bridge_error",
  "web_bridge_premium_check",
  "web_in_app_browser_escape",
  "web_paywall_view",
  "web_paywall_drawn",
  "welcome_back_view",
  "welcome_back_continue",
  "web_checkout_start",
  "web_checkout_success",
  "web_checkout_failed",
  "web_checkout_unavailable",
  "web_handoff_view",
  "web_handoff_open_app",
  "email_link_requested",
]);

/**
 * Properties Meta may get: fixed ids, codes and yes/no flags only. Anything
 * else (campaign tags, timings, error text, and any property added later) is
 * dropped until it is added here.
 */
const META_FUNNEL_PARAMS: ReadonlySet<string> = new Set([
  "step_id",
  "step_index",
  "funnel_version",
  "funnel_id",
  "entry",
  "market",
  "has_quiz_answers",
  "in_app_browser",
  "targets_available",
  "price_currency",
  "provider",
  "signup_method",
  "from_sticky",
  "has_account",
  "is_subscribed",
  "account_created",
  "plan",
  "has_trial",
  "trial_expected",
  "has_prices",
  "reason",
  "result",
  "action",
  "saved",
  "pending",
  "from",
  "trial",
  "member",
]);

export type MetaCustomParams = Record<string, string | number | boolean>;

/**
 * The Meta custom event for a web funnel event, or null when it isn't one
 * Meta gets. Null and empty properties are dropped.
 */
export function metaFunnelEvent(
  event: string,
  properties: Record<string, unknown>,
): { name: string; params: MetaCustomParams } | null {
  if (!META_FUNNEL_EVENTS.has(event)) return null;
  const params: MetaCustomParams = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!META_FUNNEL_PARAMS.has(key)) continue;
    if (typeof value === "string" ? value === "" : typeof value !== "number" && typeof value !== "boolean") continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    params[key] = value as string | number | boolean;
  }
  return { name: event, params };
}
