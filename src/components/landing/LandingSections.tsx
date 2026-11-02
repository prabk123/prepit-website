import type { WebMarket } from "@/lib/markets";
import { type Prices, TRIAL_DAYS, WEB_REMINDER_EMAIL_LIVE } from "@/lib/pricing";

/**
 * Shared copy for the direct-sale landing page (PRE-302). Its sections are
 * Landing v9 now (components/landing/v9, PRE-432 and PRE-433).
 */

/** Copy that differs between web checkout and the App Store markets. */
export function landingCopy(market: WebMarket, prices: Prices) {
  const web = market === "web";
  return {
    web,
    reassure: web
      ? { strong: `${prices.free} today.`, rest: `${WEB_REMINDER_EMAIL_LIVE ? "Reminder email on day 4. " : ""}Cancel before day 8 and you pay nothing.` }
      : market === "app-store"
        ? { strong: `${TRIAL_DAYS} days free.`, rest: "Cancel in your iPhone's settings at least 24 hours before the trial ends and you pay nothing." }
        : { strong: "Not in your country yet.", rest: "Join the waitlist and we'll tell you when you can start." },
  };
}
