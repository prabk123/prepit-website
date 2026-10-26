// Unit tests for which company bills a website subscription (PRE-355). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { webBillingKeyFor, webBillingSellerFor } from "../src/lib/revenuecat/sellers.ts";

test("US, Canada, Australia and New Zealand buy from the US company", () => {
  for (const country of ["US", "us", " ca ", "AU", "NZ"]) {
    assert.equal(webBillingSellerFor(country), "us", country);
  }
});

test("the UK, the EEA and everyone else buy from the UK company", () => {
  for (const country of ["GB", "gb", "IE", "DE", "FR", "NO", "CH", "IN", "BR", "JP", "ZA"]) {
    assert.equal(webBillingSellerFor(country), "uk", country);
  }
});

test("an unknown country buys from the UK company", () => {
  for (const value of [null, undefined, "", "USA", "X"]) {
    assert.equal(webBillingSellerFor(value), "uk", String(value));
  }
});

test("each seller gets its own key", () => {
  const keys = { shared: "rcb_sb_old", us: "rcb_sb_us", uk: " rcb_sb_uk " };
  assert.deepEqual(webBillingKeyFor("us", keys), { apiKey: "rcb_sb_us", seller: "us", fellBack: false });
  assert.deepEqual(webBillingKeyFor("uk", keys), { apiKey: "rcb_sb_uk", seller: "uk", fellBack: false });
});

test("a seller without its own key keeps today's shared key", () => {
  for (const missing of [undefined, null, "", "  "]) {
    assert.deepEqual(webBillingKeyFor("uk", { shared: "rcb_old", us: "rcb_us", uk: missing }), {
      apiKey: "rcb_old",
      seller: "uk",
      fellBack: true,
    });
    assert.deepEqual(webBillingKeyFor("us", { shared: "rcb_old", us: missing, uk: "rcb_uk" }), {
      apiKey: "rcb_old",
      seller: "us",
      fellBack: true,
    });
  }
});

test("a seller never borrows the other seller's key", () => {
  assert.deepEqual(webBillingKeyFor("us", { uk: "rcb_uk" }), { apiKey: null, seller: "us", fellBack: true });
  assert.deepEqual(webBillingKeyFor("uk", { us: "rcb_us" }), { apiKey: null, seller: "uk", fellBack: true });
});
