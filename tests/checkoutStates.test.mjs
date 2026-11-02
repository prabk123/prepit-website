// Unit tests for the checkout's states after sign-in (PRE-438). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBridgeVisit } from "../src/lib/funnel/bridgeHandoff.ts";
import {
  CHECKOUT_FAILURE_MESSAGES,
  classifyPurchasesError,
  couldNotStart,
  DECLINED_LINE,
  RC_ERROR,
  startingLine,
  welcomeBackTerms,
  welcomeRecap,
} from "../src/lib/funnel/checkoutStates.ts";
import { WEB_PRICES } from "../src/lib/pricing.ts";

const TODAY = new Date(2026, 9, 26, 9, 30); // Mon 26 Oct 2026, local time

test("a refused first charge is a decline, not a pending payment", () => {
  // purchases-js 1.68 maps "Payment charge failed" to PaymentPendingError.
  assert.equal(classifyPurchasesError(RC_ERROR.PaymentPendingError, "Payment charge failed"), "declined");
});

test("a card Stripe wouldn't save for the free week is a decline", () => {
  assert.equal(classifyPurchasesError(RC_ERROR.StoreProblemError, "Setup intent completion failed"), "declined");
  assert.equal(classifyPurchasesError(RC_ERROR.StoreProblemError, "Payment method creation failed"), "declined");
  assert.equal(classifyPurchasesError(RC_ERROR.StoreProblemError, "Setup intent creation failed"), "unknown");
});

test("the other RevenueCat errors keep their codes", () => {
  assert.equal(classifyPurchasesError(RC_ERROR.UserCancelledError, ""), "cancelled");
  assert.equal(classifyPurchasesError(RC_ERROR.ProductAlreadyPurchasedError, ""), "already_purchased");
  assert.equal(classifyPurchasesError(RC_ERROR.NetworkError, ""), "network");
  assert.equal(classifyPurchasesError(RC_ERROR.PurchaseInvalidError, ""), "not_allowed");
  assert.equal(classifyPurchasesError(RC_ERROR.IneligibleError, ""), "not_allowed");
  assert.equal(classifyPurchasesError(0, null), "unknown");
});

test("the declined line says the card wasn't added and nothing was charged", () => {
  assert.match(DECLINED_LINE, /wasn’t added/);
  assert.match(DECLINED_LINE, /haven’t been charged/);
  assert.equal(CHECKOUT_FAILURE_MESSAGES.declined, DECLINED_LINE);
  assert.equal(CHECKOUT_FAILURE_MESSAGES.cancelled, null);
});

test("starting: the free week says nothing was charged; a paid plan doesn't", () => {
  assert.deepEqual(startingLine(true), { title: "Starting your free week.", body: "You haven’t been charged." });
  assert.doesNotMatch(Object.values(startingLine(false)).join(" "), /charged|free/i);
});

test("couldn't start: not charged, plan saved only from the quiz", () => {
  const quiz = couldNotStart(true, true);
  assert.equal(quiz.title, "We couldn’t start your free week");
  assert.equal(quiz.body, "Something went wrong on our side. You haven’t been charged, and your plan is saved.");
  assert.equal(couldNotStart(true, false).body, "Something went wrong on our side. You haven’t been charged.");
  assert.doesNotMatch(couldNotStart(false, false).title, /free/);
});

test("welcome back has today's prices and no free or trial words", () => {
  for (const prices of [WEB_PRICES.us, WEB_PRICES.uk, null]) {
    const line = welcomeBackTerms(prices);
    assert.doesNotMatch(line, /free|trial/i);
    assert.match(line, /today/);
  }
  assert.match(welcomeBackTerms(WEB_PRICES.uk), /£99\.99 a year or £14\.99 a month/);
});

test("recap for a free week: due today, reminder on day 4, first payment on day 8", () => {
  const rows = welcomeRecap({ trial: true, plan: "annual", prices: WEB_PRICES.us, startedAt: TODAY, reminder: true });
  assert.deepEqual(rows, [
    { label: "Due today", value: "$0" },
    { label: "Reminder email", value: "Thu, Oct 29" },
    { label: "First payment, only if you keep PrepIt", value: "$99.99 on Mon, Nov 2" },
  ]);
  const noReminder = welcomeRecap({ trial: true, plan: "monthly", prices: WEB_PRICES.uk, startedAt: TODAY, reminder: false });
  assert.deepEqual(noReminder, [
    { label: "Due today", value: "£0" },
    { label: "First payment, only if you keep PrepIt", value: "£14.99 on Mon, Nov 2" },
  ]);
});

test("recap without a free week: paid today and the renewal", () => {
  assert.deepEqual(welcomeRecap({ trial: false, plan: "monthly", prices: WEB_PRICES.us, startedAt: TODAY, reminder: true }), [
    { label: "Paid today", value: "$14.99" },
    { label: "Renews", value: "$14.99 on Thu, Nov 26" },
  ]);
  assert.deepEqual(welcomeRecap({ trial: false, plan: "annual", prices: WEB_PRICES.us, startedAt: TODAY, reminder: true })[1], {
    label: "Renews",
    value: "$99.99 on Tue, Oct 26",
  });
});

test("recap with an unknown package shows both prices, and none without prices", () => {
  const rows = welcomeRecap({ trial: true, plan: null, prices: WEB_PRICES.us, startedAt: TODAY, reminder: false });
  assert.equal(rows[1].value, "$99.99 a year or $14.99 a month on Mon, Nov 2");
  assert.equal(welcomeRecap({ trial: true, plan: "annual", prices: null, startedAt: TODAY, reminder: true }), null);
});

test("a stored visit keeps a valid purchase only", () => {
  const purchase = { plan: "annual", seller: "uk", startedAt: "2026-10-26T09:30:00.000Z" };
  assert.deepEqual(parseBridgeVisit(JSON.stringify({ from: "quiz", trial: true, purchase })), { from: "quiz", trial: true, purchase });
  assert.deepEqual(parseBridgeVisit(JSON.stringify({ from: "quiz", trial: true, purchase: { ...purchase, seller: "eu" } })), {
    from: "quiz",
    trial: true,
  });
  assert.deepEqual(parseBridgeVisit(JSON.stringify({ from: "landing", trial: false, purchase: { ...purchase, startedAt: "x" } })), {
    from: "landing",
    trial: false,
  });
});
