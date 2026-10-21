import { DEFAULT_FUNNEL_ID } from "./params";

/** The direct-sale landing page (PRE-302). */
export const LANDING_PATH = "/try";

/** Every landing page sign-up is in this funnel. */
export const LANDING_FUNNEL_ID = DEFAULT_FUNNEL_ID;

/**
 * Where "Start my free 7 days" goes for a US visitor: the shared bridge (sign
 * in, choose a plan, pay). The design has no plan picker on this page, so no
 * plan is passed. Until the PRE-323 bridge at /start is merged this is the
 * sign-in bridge, which continues to /checkout; then it becomes
 * `/start?from=landing&funnel=direct-sale`.
 */
export function landingBridgeHref(): string {
  return `/signin?${new URLSearchParams({ funnel: LANDING_FUNNEL_ID })}`;
}
