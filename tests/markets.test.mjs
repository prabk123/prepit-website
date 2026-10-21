// Unit tests for the web market routing (PRE-331). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCountryCode, webMarketFor } from "../src/lib/markets.ts";

test("every country buys on the website, in USD for now", () => {
  for (const country of ["US", "us", "GB", "CA", "AU", "IE", "DE", "FR", "IN", "BR", "JP"]) {
    assert.equal(webMarketFor(country), "web", country);
  }
});

test("an unknown country buys on the website too", () => {
  for (const value of [null, undefined, "", "USA", "1", "X"]) {
    assert.equal(webMarketFor(value), "web", String(value));
  }
});

test("parseCountryCode keeps two letters only", () => {
  assert.equal(parseCountryCode(" gb "), "GB");
  assert.equal(parseCountryCode("GBR"), null);
  assert.equal(parseCountryCode("<x>"), null);
});
