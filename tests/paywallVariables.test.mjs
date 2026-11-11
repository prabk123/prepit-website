// Unit tests for the web paywall's custom variables (PRE-462). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  annualSaving,
  buildPaywallVariables,
  isWebPaywallOffering,
  paywallDateStyle,
  ratingLine,
  typedPaywallVariables,
} from "../src/lib/funnel/paywallVariables.ts";

const TODAY = new Date(2026, 10, 9, 9, 30); // Mon 9 Nov 2026, local time
const GBP = (pounds) => ({ amountMicros: Math.round(pounds * 1_000_000), currency: "GBP" });

const base = {
  today: TODAY,
  dateStyle: "gb",
  trial: true,
  sellerName: "DocWhizz Ltd",
  refundWindow: true,
  reminder: true,
  savedPlan: null,
  rating: null,
  signedInTitle: "Your plan is saved.",
  saving: "£79.89",
  currencyName: "pounds sterling",
};

test("rating line follows Charlie's rule", () => {
  assert.equal(ratingLine({ average: 5, count: 8, storefront: "gb" }), "Rated 5 stars on the UK App Store");
  assert.equal(ratingLine({ average: 4.96, count: 20, storefront: "gb" }), "Rated 5 stars on the UK App Store");
  assert.equal(ratingLine({ average: 4.81, count: 20, storefront: "us" }), "Rated 4.8 stars on the US App Store");
  assert.equal(ratingLine({ average: 4.6, count: 9, storefront: "de" }), "Rated 4.6 stars on the App Store");
  assert.equal(ratingLine({ average: 3.94, count: 17, storefront: "us" }), null, "below 4.5 is hidden");
  assert.equal(ratingLine({ average: 5, count: 4, storefront: "gb" }), null, "fewer than 5 ratings is hidden");
  assert.equal(ratingLine(null), null);
});

test("UK dates match the copy deck: reminder day 4, session 3 day 7, payment day 8", () => {
  const v = buildPaywallVariables(base);
  assert.equal(v.date_today, "Mon 9 Nov");
  assert.equal(v.date_reminder, "Thu 12 Nov");
  assert.equal(v.date_session3, "Sun 15 Nov");
  assert.equal(v.date_first_payment, "Mon 16 Nov");
  assert.equal(v.date_first_payment_long, "16 November 2026");
  assert.equal(v.date_reminder_long, "12 November 2026");
  assert.equal(v.renewal_annual, "16 Nov 2027");
  assert.equal(v.renewal_monthly, "the 16th of each month");
  assert.equal(v.seller_name, "DocWhizz Ltd");
  assert.equal(v.currency_note, "Prices in pounds sterling.");
  assert.equal(v.show_refund_window, true);
});

test("US dates and seller", () => {
  const v = buildPaywallVariables({ ...base, dateStyle: "us", sellerName: "DOCWHIZZ, LLC", refundWindow: false, currencyName: "US dollars" });
  assert.equal(v.date_today, "Mon, Nov 9");
  assert.equal(v.date_reminder, "Thu, Nov 12");
  assert.equal(v.date_first_payment, "Mon, Nov 16");
  assert.equal(v.date_first_payment_long, "November 16, 2026");
  assert.equal(v.renewal_annual, "Nov 16, 2027");
  assert.equal(v.seller_name, "DOCWHIZZ, LLC");
  assert.equal(v.currency_note, "Prices in US dollars.");
  assert.equal(v.show_refund_window, false);
});

test("monthly renewal ordinals", () => {
  const day = (d) => buildPaywallVariables({ ...base, today: new Date(2026, 0, d - 7, 9) }).renewal_monthly;
  assert.equal(day(21), "the 21st of each month");
  assert.equal(day(22), "the 22nd of each month");
  assert.equal(day(23), "the 23rd of each month");
  assert.equal(day(11), "the 11th of each month");
});

test("saved plan line shows only with the quiz's targets", () => {
  const none = buildPaywallVariables(base);
  assert.equal(none.show_saved_plan, false);
  assert.equal(none.plan_for, "");
  const quiz = buildPaywallVariables({
    ...base,
    savedPlan: { forLine: "For the 3pm crash.", calories: 1330, proteinGrams: 160 },
  });
  assert.equal(quiz.show_saved_plan, true);
  assert.equal(quiz.plan_for, "For the 3pm crash.");
  assert.equal(quiz.plan_targets, "1,330 kcal and 160 g protein a day");
  const noTargets = buildPaywallVariables({ ...base, savedPlan: { forLine: "For the 3pm crash.", calories: 1330 } });
  assert.equal(noTargets.show_saved_plan, false, "both targets are needed");
});

test("reminder and rating flags", () => {
  assert.equal(buildPaywallVariables({ ...base, reminder: false }).show_reminder, false);
  const rated = buildPaywallVariables({ ...base, rating: { average: 5, count: 8, storefront: "gb" } });
  assert.equal(rated.show_rating, true);
  assert.equal(rated.rating_line, "Rated 5 stars on the UK App Store");
  assert.equal(rated.signed_in_line, "Your plan is saved.");
});

test("annual saving is 12 monthly payments minus the annual price", () => {
  assert.equal(annualSaving(GBP(99.99), GBP(14.99)), "£79.89");
  assert.equal(annualSaving({ amountMicros: 99_990_000, currency: "USD" }, { amountMicros: 14_990_000, currency: "USD" }), "$79.89");
  assert.equal(annualSaving(GBP(99.99), null), null);
  assert.equal(annualSaving(GBP(200), GBP(10)), null, "no saving, no pill amount");
  assert.equal(annualSaving(GBP(99.99), { amountMicros: 14_990_000, currency: "USD" }), null);
});

test("typed variables match the SDK's CustomVariableValue shape", () => {
  const typed = typedPaywallVariables({ a: "x", b: true });
  assert.deepEqual(typed, { a: { type: "string", value: "x" }, b: { type: "boolean", value: true } });
});

test("no free week: renewals count from today and there is no reminder", () => {
  const v = buildPaywallVariables({ ...base, trial: false });
  assert.equal(v.renewal_monthly, "the 9th of each month");
  assert.equal(v.renewal_annual, "9 Nov 2027");
  assert.equal(v.show_reminder, false);
});

test("month ends and 29 February", () => {
  const monthly = buildPaywallVariables({ ...base, trial: false, today: new Date(2026, 0, 31, 9) }).renewal_monthly;
  assert.equal(monthly, "the 31st of each month, or the last day of shorter months");
  const leap = buildPaywallVariables({ ...base, trial: false, today: new Date(2028, 1, 29, 9) });
  assert.equal(leap.renewal_annual, "28 Feb 2029");
});

test("date style follows the country, not the seller", () => {
  assert.equal(paywallDateStyle("US"), "us");
  assert.equal(paywallDateStyle("ca"), "us");
  assert.equal(paywallDateStyle("AU"), "gb");
  assert.equal(paywallDateStyle("NZ"), "gb");
  assert.equal(paywallDateStyle(null), "gb");
});

test("the web paywall is web_checkout or any offering marked surface web", () => {
  assert.equal(isWebPaywallOffering({ identifier: "web_checkout", metadata: null }), true);
  assert.equal(isWebPaywallOffering({ identifier: "web_checkout_b", metadata: { surface: "web" } }), true);
  assert.equal(isWebPaywallOffering({ identifier: "annual_monthly_7_day", metadata: null }), false);
  assert.equal(isWebPaywallOffering(null), false);
});

test("no currency note when the offering isn't in the seller's currency", () => {
  assert.equal(buildPaywallVariables({ ...base, currencyName: null }).currency_note, "");
});
