import { bridgePath, DEFAULT_FUNNEL_ID } from "./params";

/** The direct-sale landing page (PRE-302). */
export const LANDING_PATH = "/try";

/** Every landing page sign-up is in this funnel. */
export const LANDING_FUNNEL_ID = DEFAULT_FUNNEL_ID;

/**
 * Where "Start my free 7 days" goes where the website sells (every country
 * for now): the cart on `/start` (PRE-437), which signs people in and then
 * shows RevenueCat's paywall. No plan is passed: it's picked on the paywall.
 */
export function landingBridgeHref(): string {
  return bridgePath({ from: "landing", funnel: LANDING_FUNNEL_ID });
}
