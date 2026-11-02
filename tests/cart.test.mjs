// Unit tests for the cart on /start before sign-in (PRE-437). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { STARTING_POINT_IDS } from "../src/lib/funnel/bridgeHandoff.ts";
import { buildCartMarket, CART_WHO, cartDates, cartTermsText, cartWho } from "../src/lib/funnel/cart.ts";
import { WEB_PRICES } from "../src/lib/pricing.ts";
import { emptyAnswers, startingPointId } from "../src/lib/quiz/quiz.ts";

const TODAY = new Date(2026, 9, 26, 9, 30); // Mon 26 Oct 2026, local time

test("the reminder is day 4 and the first payment day 8, from today", () => {
  const d = cartDates(TODAY);
  assert.equal(d.reminderShort, "Thu, Oct 29");
  assert.equal(d.chargeShort, "Mon, Nov 2");
  assert.equal(d.chargeMonthDay, "Nov 2");
  assert.equal(d.chargeLong, "November 2, 2026");
  assert.equal(d.reminderLong, "October 29, 2026");
});

test("US terms: dollars, no 14-day line", () => {
  const market = buildCartMarket({ country: "US", seller: "us", prices: WEB_PRICES.us, inEeaOrUk: false });
  assert.equal(market.refundWindow, false);
  assert.equal(
    cartTermsText(market, TODAY),
    "$0 today. Free for 7 days, then $99.99 a year or $14.99 a month, whichever you choose on the next step, first charged on November 2, 2026, then renewing at that price until you cancel. We’ll email you a reminder on October 29, 2026. Cancel online any time before November 2, 2026 and you pay nothing. Prices in US dollars. By continuing you agree to the Terms and Subscription Policy.",
  );
});

test("UK and Ireland terms: pounds and the 14-day refund line", () => {
  for (const country of ["GB", "IE"]) {
    const market = buildCartMarket({ country, seller: "uk", prices: WEB_PRICES.uk, inEeaOrUk: true });
    const text = cartTermsText(market, TODAY);
    assert.match(text, /£99\.99 a year or £14\.99 a month/);
    assert.match(text, /You can also cancel within 14 days of signing up for a full refund\. Prices in pounds sterling\./);
  }
  // UK seller outside the UK and EEA: no 14-day line. Unknown country: the site applies UK/EEA rules.
  assert.equal(buildCartMarket({ country: "IN", seller: "uk", prices: WEB_PRICES.uk, inEeaOrUk: false }).refundWindow, false);
  assert.equal(buildCartMarket({ country: null, seller: "uk", prices: WEB_PRICES.uk, inEeaOrUk: false }).refundWindow, true);
});

test("no prices: the price-before-you-start fallback, no currency line", () => {
  const market = buildCartMarket({ country: "US", seller: "us", prices: null, inEeaOrUk: false });
  const text = cartTermsText(market, TODAY);
  assert.match(text, /You’ll see the price before you start\./);
  assert.doesNotMatch(text, /\$|Prices in/);
  assert.doesNotMatch(text, /in your currency/);
});

test("without the day-4 email the reminder sentence drops", () => {
  const market = buildCartMarket({ country: "US", seller: "us", prices: WEB_PRICES.us, inEeaOrUk: false });
  assert.doesNotMatch(cartTermsText(market, TODAY, false), /reminder/);
});

test("landing visitors get the default line and no You said line", () => {
  assert.deepEqual(cartWho("landing", "dip"), { line: "For however you eat.", said: null });
  assert.deepEqual(cartWho("quiz", undefined), { line: "For however you eat.", said: null });
  assert.equal(cartWho("quiz", "weekend").line, "For the weekend wobble.");
});

test("every starting point has a line", () => {
  for (const id of STARTING_POINT_IDS) {
    assert.ok(CART_WHO[id].line.startsWith("For "), id);
    assert.ok(CART_WHO[id].said.startsWith("You "), id);
  }
});

test("startingPointId follows the quiz's first sticking point", () => {
  const a = (patch) => ({ ...emptyAnswers(), ...patch });
  assert.equal(startingPointId(a({ energy: "I dip mid-afternoon", skipsBreakfast: "Yes" })), "dip_breakfast");
  assert.equal(startingPointId(a({ energy: "I dip mid-afternoon" })), "dip");
  assert.equal(startingPointId(a({ energy: "Low most days" })), "low");
  assert.equal(startingPointId(a({ blockers: ["Weekends derail me"] })), "weekend");
  assert.equal(startingPointId(a({ eveningSnacks: "Yes" })), "evening");
  assert.equal(startingPointId(a({ hunger: "I graze all day" })), "graze");
  assert.equal(startingPointId(a({ blockers: ["I don't know what to eat"] })), "dinner");
  assert.equal(startingPointId(a({ blockers: ["I lose motivation"] })), "going");
  assert.equal(startingPointId(a({})), "none");
});
