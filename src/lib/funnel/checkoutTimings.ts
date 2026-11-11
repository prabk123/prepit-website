/**
 * How long the web paywall takes to appear after sign-in (PRE-464), step by
 * step, sent to PostHog on `web_paywall_view` and `web_paywall_drawn`.
 *
 * The clock starts the first time this page sees the visitor signed in (right
 * after the Apple or Google sign-in, or on arrival for someone already signed
 * in). Each step is the milliseconds from then to the first time it finished.
 * The RevenueCat steps run alongside the PrepIt account steps, so they can
 * finish before them.
 *
 * Pure (no imports), so `tests/checkoutTimings.test.mjs` can drive it with its own clock.
 */

export const CHECKOUT_STEPS = [
  /** The PrepIt account summary (`GET /account`) is back. */
  "account",
  /** /start only: the account and the quiz's answers are saved, so checkout can show. */
  "signup_saved",
  /** RevenueCat's SDK is loaded and configured for this customer. */
  "rc_ready",
  /** RevenueCat's customer info (the "already subscribed?" check) is back. */
  "customer_info",
  /** The paywall's offering is back. */
  "offering",
  /** `presentPaywall` was called: everything above is done. */
  "paywall_start",
  /** The paywall is on screen with its fonts and icons, and the skeleton has faded out. */
  "paywall_drawn",
] as const;

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

type Run = { uid: string; start: number; steps: Partial<Record<CheckoutStep, number>> };

export type CheckoutTimer = {
  /** Starts the clock for this uid, unless it's already running for them. */
  start: (uid: string) => void;
  /** Records a step for this uid the first time it finishes. Ignored for any other uid. */
  mark: (uid: string, step: CheckoutStep) => void;
  /** `load_<step>_ms` for every step: the milliseconds, or null when it hasn't happened. */
  properties: (uid: string) => Record<`load_${CheckoutStep}_ms`, number | null>;
};

export function createCheckoutTimer(now: () => number): CheckoutTimer {
  let run: Run | null = null;
  return {
    start(uid) {
      if (!uid || run?.uid === uid) return;
      run = { uid, start: now(), steps: {} };
    },
    mark(uid, step) {
      if (!run || run.uid !== uid || run.steps[step] !== undefined) return;
      run.steps[step] = Math.max(0, Math.round(now() - run.start));
    },
    properties(uid) {
      const steps = run && run.uid === uid ? run.steps : {};
      return Object.fromEntries(CHECKOUT_STEPS.map((step) => [`load_${step}_ms`, steps[step] ?? null])) as Record<
        `load_${CheckoutStep}_ms`,
        number | null
      >;
    },
  };
}

/** The page's one timer. `performance.now()` keeps counting across client-side navigations. */
export const checkoutTimer = createCheckoutTimer(() =>
  typeof performance !== "undefined" ? performance.now() : Date.now(),
);
