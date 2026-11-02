/**
 * The checkout's states after sign-in (PRE-438), from Charlie's cart v6.1
 * notes: Welcome back, the "Starting your free week" line, our line over a
 * declined card, and the "You're in" recap. Kept free of React and of the
 * RevenueCat SDK so the node tests can run it on its own.
 */
import type { PlanId } from "@/lib/pricing";

/**
 * Day `day` of the free week (day 1 is the start), as `trialDay` in cart.ts
 * counts it. Repeated here because node's test runner can only follow type
 * imports between these files.
 */
function trialDay(day: number, from: Date): Date {
  const date = new Date(from);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + day - 1);
  return date;
}

/** "Thu, Oct 29", as on the cart. */
const shortDate = (date: Date) => date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/** Why a purchase didn't go through, as a fixed code for analytics and the message. */
export type CheckoutFailure = "cancelled" | "already_purchased" | "declined" | "network" | "not_allowed" | "unknown";

/**
 * RevenueCat's public error codes (purchases-js `ErrorCode`), as numbers so
 * this file never loads the SDK. Only the ones checkout tells apart.
 */
export const RC_ERROR = {
  UserCancelledError: 1,
  StoreProblemError: 2,
  PurchaseNotAllowedError: 3,
  PurchaseInvalidError: 4,
  ProductAlreadyPurchasedError: 6,
  NetworkError: 10,
  IneligibleError: 18,
  PaymentPendingError: 20,
} as const;

/**
 * The messages purchases-js 1.68 gives when Stripe turned the card down
 * while saving it (a free trial saves the card with a SetupIntent) or while
 * making the payment method. Both arrive as StoreProblemError.
 */
const CARD_NOT_ACCEPTED_MESSAGES = ["Setup intent completion failed", "Payment method creation failed"];

/**
 * The failure code for a RevenueCat error. purchases-js 1.68 reports "Payment
 * charge failed" (the bank refused a paid first charge) as PaymentPendingError,
 * so that code is a decline, not a payment still in progress.
 */
export function classifyPurchasesError(errorCode: number, message: string | null | undefined): CheckoutFailure {
  switch (errorCode) {
    case RC_ERROR.UserCancelledError:
      return "cancelled";
    case RC_ERROR.ProductAlreadyPurchasedError:
      return "already_purchased";
    case RC_ERROR.PaymentPendingError:
      return "declined";
    case RC_ERROR.StoreProblemError:
      return message && CARD_NOT_ACCEPTED_MESSAGES.includes(message) ? "declined" : "unknown";
    case RC_ERROR.NetworkError:
      return "network";
    case RC_ERROR.PurchaseNotAllowedError:
    case RC_ERROR.IneligibleError:
    case RC_ERROR.PurchaseInvalidError:
      return "not_allowed";
    default:
      return "unknown";
  }
}

/**
 * Our line over RevenueCat's own error when the card is declined: it wasn't
 * added and nothing was charged. RevenueCat's sheet covers the page while
 * it's open, so this is what they see when it closes.
 */
export const DECLINED_LINE =
  "Your bank didn’t accept that card, so it wasn’t added. You haven’t been charged. Try Apple Pay or another card.";

/** The message under the paywall when a purchase ends without going through. Cancelling shows nothing. */
export const CHECKOUT_FAILURE_MESSAGES: Record<CheckoutFailure, string | null> = {
  cancelled: null,
  already_purchased: "You already have this subscription.",
  declined: DECLINED_LINE,
  network: "We couldn’t reach the payment service. Check your connection and try again.",
  not_allowed: "This payment couldn’t go through. Please try a different card or try again.",
  unknown:
    "Something went wrong with the payment. If you were charged, your subscription will show up shortly. Otherwise, please try again.",
};

/** The status line while RevenueCat confirms the purchase. */
export function startingLine(trial: boolean): { title: string; body: string } {
  return trial
    ? { title: "Starting your free week.", body: "You haven’t been charged." }
    : { title: "Starting your plan.", body: "This takes a few seconds. Please keep this page open." };
}

/**
 * "We couldn't start your free week": nothing was charged, the quiz plan is
 * saved, and Try again. `trial` false (a returning member) drops "free week".
 */
export function couldNotStart(trial: boolean, planSaved: boolean): { title: string; body: string } {
  return {
    title: trial ? "We couldn’t start your free week" : "We couldn’t start your plan",
    body: `Something went wrong on our side. You haven’t been charged${planSaved ? ", and your plan is saved" : ""}.`,
  };
}

/**
 * The prices RevenueCat will charge this visitor, from the offering's own
 * packages (so the currency, tax and any price change always match the
 * payment form), formatted as RevenueCat formats them.
 */
export type CheckoutPrices = { annual: string; annualPerMonth: string | null; monthly: string; free: string };

/** A RevenueCat price as purchases-js gives it (`Price`), without loading the SDK. */
export type RcPrice = { amountMicros: number; currency: string; formattedPrice: string };

/** "$0" or "£0" in the package's currency, for "Due today". */
export function zeroIn(currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(0);
  } catch {
    return "0";
  }
}

/** The annual price over 12 months, rounded down like the cart's "$8.33 a month". */
function perMonth(annual: RcPrice): string | null {
  try {
    const cents = Math.floor(annual.amountMicros / 12 / 10_000);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: annual.currency }).format(cents / 100);
  } catch {
    return null;
  }
}

/**
 * Both plans' prices from the offering, or null when either is missing, so
 * the page falls back to "You'll see the price on the next step".
 */
export function offeringPrices({
  annual,
  monthly,
}: {
  annual: RcPrice | null | undefined;
  monthly: RcPrice | null | undefined;
}): CheckoutPrices | null {
  if (!annual || !monthly || annual.currency !== monthly.currency) return null;
  return {
    annual: annual.formattedPrice,
    annualPerMonth: perMonth(annual),
    monthly: monthly.formattedPrice,
    free: zeroIn(annual.currency),
  };
}

/**
 * The Welcome back step's price line: today's price, with no "free" or
 * "trial" words, because the cart said $0 and this account has had its week.
 */
export function welcomeBackTerms(prices: CheckoutPrices | null): string {
  return prices
    ? `You pay today for the plan you pick next: ${prices.annual} a year or ${prices.monthly} a month, renewing until you cancel. Cancel online any time.`
    : "You pay today for the plan you pick next, renewing until you cancel. You’ll see the price on the next step. Cancel online any time.";
}

/** One row of the "You're in" recap. */
export type RecapRow = { label: string; value: string };

function addPeriod(from: Date, plan: PlanId): Date {
  const date = new Date(from);
  date.setHours(12, 0, 0, 0);
  if (plan === "annual") date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date;
}

/**
 * The recap on "You're in": what was due today, the reminder email and the
 * first payment for a free week; today's price and the renewal otherwise.
 * `amount` is the bought package's price as RevenueCat formatted it and
 * `free` zero in its currency; null when checkout couldn't record them.
 */
export function welcomeRecap({
  trial,
  plan,
  amount,
  free,
  startedAt,
  reminder,
}: {
  trial: boolean;
  plan: PlanId | null;
  amount: string | null;
  free: string;
  startedAt: Date;
  reminder: boolean;
}): RecapRow[] | null {
  if (!amount) return null;
  if (trial) {
    return [
      { label: "Due today", value: free },
      ...(reminder ? [{ label: "Reminder email", value: shortDate(trialDay(4, startedAt)) }] : []),
      { label: "First payment, only if you keep PrepIt", value: `${amount} on ${shortDate(trialDay(8, startedAt))}` },
    ];
  }
  return [
    { label: "Paid today", value: amount },
    ...(plan ? [{ label: "Renews", value: `${amount} on ${shortDate(addPeriod(startedAt, plan))}` }] : []),
  ];
}

/**
 * "Email me the link" on the desktop "You're in" page sends
 * `email_link_requested`, and the PostHog workflow "Web: Email me the app
 * link (PRE-438)" emails the /open link to the person. Turn this off again if
 * that workflow is ever paused, so the button never promises an email nobody
 * sends.
 */
export const APP_LINK_EMAIL_LIVE = true;
