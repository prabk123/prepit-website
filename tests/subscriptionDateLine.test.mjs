// Unit tests for the account page's trial and renewal line (PRE-335). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { subscriptionDateLine } from "../src/lib/revenuecat/subscriptionDateLine.ts";

const date = new Date("2026-10-28T18:00:00Z");
const format = () => "28 October 2026";

test("a trial that will renew names the first payment date", () => {
  assert.equal(
    subscriptionDateLine({ expirationDate: date, willRenew: true, inTrial: true }, format),
    "Free trial. Your first payment is on 28 October 2026.",
  );
});

test("a trial cancelled before it ends says nothing will be charged", () => {
  assert.equal(
    subscriptionDateLine({ expirationDate: date, willRenew: false, inTrial: true }, format),
    "Free trial ends on 28 October 2026. You won't be charged.",
  );
});

test("paid subscriptions keep the renew and end lines", () => {
  assert.equal(subscriptionDateLine({ expirationDate: date, willRenew: true, inTrial: false }, format), "Renews on 28 October 2026.");
  assert.equal(
    subscriptionDateLine({ expirationDate: date, willRenew: false, inTrial: false }, format),
    "Ends on 28 October 2026. It won't renew.",
  );
});

test("no date: a trial still says so, a paid subscription shows nothing", () => {
  assert.equal(subscriptionDateLine({ expirationDate: null, willRenew: true, inTrial: true }, format), "Free trial.");
  assert.equal(subscriptionDateLine({ expirationDate: null, willRenew: true, inTrial: false }, format), null);
});
