// Unit tests for the web market routing (PRE-331). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCountryCode, parseRegionCode, waitlistRegionFor, webMarketFor } from "../src/lib/markets.ts";

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

test("Quebec gets the waitlist; the rest of Canada buys on the website (PRE-354)", () => {
  assert.equal(webMarketFor("CA", "QC"), "waitlist");
  assert.equal(webMarketFor("ca", " qc "), "waitlist");
  for (const region of ["ON", "BC", "AB", null, undefined, ""]) {
    assert.equal(webMarketFor("CA", region), "web", String(region));
  }
  // QC is only Quebec inside Canada.
  assert.equal(webMarketFor("US", "QC"), "web");
  assert.equal(webMarketFor(null, "QC"), "web");
});

test("waitlistRegionFor names the blocked region", () => {
  assert.equal(waitlistRegionFor("CA", "QC"), "CA-QC");
  assert.equal(waitlistRegionFor("CA", "ON"), null);
  assert.equal(waitlistRegionFor("CA", null), null);
});

test("parseRegionCode keeps short codes only", () => {
  assert.equal(parseRegionCode(" qc "), "QC");
  assert.equal(parseRegionCode("ENG"), "ENG");
  assert.equal(parseRegionCode("QUEBEC"), null);
  assert.equal(parseRegionCode("<x>"), null);
});
