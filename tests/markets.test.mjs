// Unit tests for the US-only web market routing (PRE-331). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCountryCode, webMarketFor } from "../src/lib/markets.ts";

test("the US buys on the website", () => {
  assert.equal(webMarketFor("US"), "web");
  assert.equal(webMarketFor("us"), "web");
});

test("the design's other markets go to the App Store", () => {
  for (const country of ["GB", "CA", "AU", "NZ", "IE", "MT", "CY"]) {
    assert.equal(webMarketFor(country), "app-store", country);
  }
});

test("countries PrepIt doesn't sell in get the waitlist", () => {
  for (const country of ["DE", "FR", "IN", "BR", "JP"]) {
    assert.equal(webMarketFor(country), "waitlist", country);
  }
});

test("an unknown country never gets web checkout", () => {
  for (const value of [null, undefined, "", "USA", "1", "X"]) {
    assert.equal(webMarketFor(value), "app-store", String(value));
  }
});

test("parseCountryCode keeps two letters only", () => {
  assert.equal(parseCountryCode(" gb "), "GB");
  assert.equal(parseCountryCode("GBR"), null);
  assert.equal(parseCountryCode("<x>"), null);
});
