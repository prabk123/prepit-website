/**
 * "Not ready? Email me my plan" on the cart (PRE-439, web funnel v9). It
 * replaces the quiz's email gate as an opt-in way to keep the plan: a small
 * form behind a quiet link at the foot of the cart, for quiz visitors whose
 * answers are in this browser. The lead goes to the backend's `POST /web-leads`
 * (PRE-327) with `source: "cart"`, and PostHog's web lead workflow sends the
 * plan email.
 *
 * Kept free of React so it can be tested on its own.
 */
import type { Attribution } from "./attribution";
import type { BridgeHandoff } from "./bridgeHandoff";
import type { BridgeSource } from "./params";

/**
 * On while the plan email can actually go out: `NEXT_PUBLIC_CART_EMAIL_PLAN=on`.
 * The PostHog workflow that sends it is a draft until Prabodh publishes it,
 * and the link must not promise an email nobody sends.
 */
export function isCartEmailPlanEnabled(value: string | undefined = process.env.NEXT_PUBLIC_CART_EMAIL_PLAN): boolean {
  return value?.trim().toLowerCase() === "on";
}

/** Quiz entry only, and only with the quiz's answers in this browser: there's nothing to email otherwise. */
export function showCartEmailPlan(from: BridgeSource, handoff: BridgeHandoff | null, enabled: boolean): boolean {
  if (!enabled || from !== "quiz" || !handoff) return false;
  return Boolean(handoff.answers?.length || (handoff.user && Object.keys(handoff.user).length) || (handoff.settings && Object.keys(handoff.settings).length));
}

/** The lead's country: the server's geo header, US when it's missing (as the quiz does). */
export function cartLeadCountry(country: string | null | undefined): string {
  const code = country?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : "US";
}

/** What `POST /web-leads` gets from the cart: the quiz's answers as the quiz left them, never typed into a URL. */
export function cartLeadInput(params: {
  handoff: BridgeHandoff;
  email: string;
  marketingConsent: boolean;
  consentText: string;
  webSessionId: string;
  country: string | null | undefined;
  attribution?: Attribution | null;
}) {
  const { handoff } = params;
  return {
    webSessionId: params.webSessionId,
    email: params.email.trim(),
    marketingConsent: params.marketingConsent,
    consentText: params.consentText,
    country: cartLeadCountry(params.country),
    funnelId: handoff.funnelId,
    ...(handoff.funnelVersion ? { funnelVersion: handoff.funnelVersion } : {}),
    source: "cart" as const,
    answers: handoff.answers ?? [],
    user: handoff.user ?? {},
    settings: handoff.settings ?? {},
    attribution: params.attribution ?? null,
  };
}
