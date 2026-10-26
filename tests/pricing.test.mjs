// Unit tests for the website's prices by seller (PRE-373). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { PRICES, WEB_PRICES } from "../src/lib/pricing.ts";
import { webBillingSellerFor } from "../src/lib/revenuecat/sellers.ts";

const amount = (price) => Number.parseFloat(price.replace(/[^\d.]/g, ""));

test("the US company sells in dollars and the UK company in pounds", () => {
  assert.equal(WEB_PRICES[webBillingSellerFor("US")].currency, "USD");
  assert.equal(WEB_PRICES[webBillingSellerFor("GB")].currency, "GBP");
  assert.equal(WEB_PRICES[webBillingSellerFor("DE")].currency, "GBP");
  assert.equal(WEB_PRICES[webBillingSellerFor(null)].currency, "GBP");
  assert.equal(WEB_PRICES.uk.annual, "£99.99");
  assert.equal(WEB_PRICES.uk.monthly, "£14.99");
});

test("every figure is in the price list's own currency", () => {
  for (const [seller, prices] of Object.entries(WEB_PRICES)) {
    const symbol = prices.currency === "USD" ? "$" : "£";
    for (const key of ["annual", "annualPerWeek", "annualPerMonth", "monthly", "free"]) {
      assert.ok(prices[key].startsWith(symbol), `${seller} ${key}: ${prices[key]}`);
    }
  }
});

test("the derived figures match the annual and monthly prices", () => {
  for (const prices of Object.values(WEB_PRICES)) {
    const annual = amount(prices.annual);
    const monthly = amount(prices.monthly);
    assert.equal(amount(prices.annualPerWeek), Math.round((annual / 52) * 100) / 100);
    assert.equal(amount(prices.annualPerMonth), Math.floor((annual / 12) * 100) / 100);
    assert.equal(prices.annualSavingPercent, `${Math.floor((1 - annual / (monthly * 12)) * 100)}%`);
  }
});

test("the App Store copy keeps the US dollar prices", () => {
  assert.equal(PRICES, WEB_PRICES.us);
});
