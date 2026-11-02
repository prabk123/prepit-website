import { bridgePath, DEFAULT_FUNNEL_ID } from "./params";

/** The direct-sale landing page (PRE-302). */
export const LANDING_PATH = "/try";

/** Every landing page sign-up is in this funnel. */
export const LANDING_FUNNEL_ID = DEFAULT_FUNNEL_ID;

/**
 * Sign-ups that start on the homepage, which shows the same Landing v9
 * sections as /try (PRE-444). Their own funnel id keeps /try's trial starts
 * per visitor clean for the landing test (PRE-445).
 */
export const HOME_FUNNEL_ID = "home";

/**
 * Where "Start my free 7 days" goes where the website sells (every country
 * for now): the cart on `/start` (PRE-437), which signs people in and then
 * shows RevenueCat's paywall. No plan is passed: it's picked on the paywall.
 */
export function landingBridgeHref(funnel: string = LANDING_FUNNEL_ID): string {
  return bridgePath({ from: "landing", funnel });
}
