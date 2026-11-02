/**
 * The cart (PRE-437): `/start` before sign-in, from Charlie's cart v6.1
 * (web funnel v9). The plan itself is still picked on RevenueCat's paywall
 * after sign-in; the cart only shows the prices, by the company that bills
 * the visitor, and the dated free week.
 *
 * Kept free of React so it can be tested on its own.
 */
import type { Prices } from "@/lib/pricing";
import type { WebBillingSeller } from "@/lib/revenuecat/sellers";
import type { StartingPointId } from "./bridgeHandoff";

/** The "For…" line on the plan card's still, and the "You said…" line under it. */
export const CART_WHO: Record<StartingPointId, { line: string; said: string }> = {
  dip: { line: "For the 3pm crash.", said: "You said your energy dips in the afternoon." },
  dip_breakfast: {
    line: "For the 3pm crash.",
    said: "You said your energy dips in the afternoon and you often skip breakfast.",
  },
  low: { line: "For running on fumes.", said: "You said your energy is low most days." },
  tired: { line: "For running on fumes.", said: "You said tiredness gets in the way." },
  weekend: {
    line: "For the weekend wobble.",
    said: "You said weekdays go to plan, and weekends and meals out are harder.",
  },
  evening: { line: "For the 9pm cupboard.", said: "You said hunger shows up between meals, mostly in the evening." },
  graze: { line: "For the snack drawer.", said: "You said hunger shows up between meals." },
  cravings: { line: "For the snack drawer.", said: "You said snack cravings get in the way." },
  dinner: { line: "For “what’s for dinner?”", said: "You said deciding what to eat is the hard part." },
  going: { line: "For “I’ll start Monday.”", said: "You said keeping track takes too long or motivation fades." },
  none: { line: "For however you eat.", said: "You didn’t flag a sticking point, which is a good start." },
};

/** What a landing visitor (or a quiz visitor with no stored answer) sees on the still. */
export const CART_DEFAULT_LINE = "For however you eat.";

/** The cart's lines for an entry: the "You said" line only for the quiz. */
export function cartWho(
  from: "landing" | "quiz",
  startingPoint: StartingPointId | undefined,
): { line: string; said: string | null } {
  if (from !== "quiz" || !startingPoint) return { line: CART_DEFAULT_LINE, said: null };
  return CART_WHO[startingPoint];
}

/** What the cart knows about the market, worked out on the server from the visitor's country. */
export type CartMarket = {
  seller: WebBillingSeller;
  /** Null when the prices couldn't be read: the cart says "You'll see the price before you start". */
  prices: Prices | null;
  /** UK, Ireland and the rest of the EEA (and an unknown country, as the site treats it): the 14-day refund line. */
  refundWindow: boolean;
};

/**
 * The cart's market from the server's reading of the visitor's country
 * (start/page.tsx passes `webBillingSellerFor`, `WEB_PRICES` and `isEuCountry`,
 * so this file stays importable by the node tests on its own).
 */
export function buildCartMarket({
  country,
  seller,
  prices,
  inEeaOrUk,
}: {
  country: string | null | undefined;
  seller: WebBillingSeller;
  prices: Prices | null | undefined;
  inEeaOrUk: boolean;
}): CartMarket {
  const known = Boolean(country?.trim());
  return { seller, prices: prices ?? null, refundWindow: seller === "uk" && (!known || inEeaOrUk) };
}

/** Day 1 is today; the reminder email goes on day 4 and the first charge on day 8. */
export function trialDay(day: number, from = new Date()): Date {
  const date = new Date(from);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + day - 1);
  return date;
}

/** "Thu, Oct 29" */
export const shortDate = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
/** "Nov 2" */
export const monthDay = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
/** "November 2, 2026" */
export const longDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/** The cart's dates, from today. */
export function cartDates(today: Date) {
  const reminder = trialDay(4, today);
  const charge = trialDay(8, today);
  return {
    reminderShort: shortDate(reminder),
    reminderLong: longDate(reminder),
    chargeShort: shortDate(charge),
    chargeMonthDay: monthDay(charge),
    chargeLong: longDate(charge),
  };
}

/** One piece of the terms sentence; `strong` pieces are bold on the page, `agree` carries the two legal links. */
export type CartTermsPart = { text: string; strong?: boolean; agree?: boolean };

/**
 * The dated terms sentence, per market, in pieces so the page can bold the
 * amounts and the charge date and link Terms and Subscription Policy. The
 * cart renders exactly these pieces; `cartTermsText` joins them for tests.
 * `reminder` is `WEB_REMINDER_EMAIL_LIVE` (lib/pricing.ts).
 */
export function cartTermsParts(market: CartMarket, today: Date, reminder: boolean): CartTermsPart[] {
  const d = cartDates(today);
  const p = market.prices;
  const parts: CartTermsPart[] = p
    ? [
        { text: `${p.free} today. Free for 7 days, then ` },
        { text: `${p.annual} a year or ${p.monthly} a month`, strong: true },
        { text: ", whichever you choose on the next step, first charged on " },
        { text: d.chargeLong, strong: true },
        { text: ", then renewing at that price until you cancel." },
      ]
    : [
        { text: "Nothing to pay today. Free for 7 days, then the plan you choose on the next step, first charged on " },
        { text: d.chargeLong, strong: true },
        { text: ", then renewing until you cancel. You’ll see the price before you start." },
      ];
  if (reminder) parts.push({ text: ` We’ll email you a reminder on ${d.reminderLong}.` });
  parts.push({ text: ` Cancel online any time before ${d.chargeLong} and you pay nothing.` });
  if (market.refundWindow) parts.push({ text: " You can also cancel within 14 days of signing up for a full refund." });
  if (p) parts.push({ text: ` Prices in ${p.currencyName}.` });
  parts.push({ text: " By continuing you agree to the Terms and Subscription Policy.", agree: true });
  return parts;
}

export function cartTermsText(market: CartMarket, today: Date, reminder: boolean): string {
  return cartTermsParts(market, today, reminder)
    .map((part) => part.text)
    .join("");
}
