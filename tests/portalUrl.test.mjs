// Unit tests for the billing portal address check (PRE-304). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { isRevenueCatPortalUrl } from "../src/lib/revenuecat/portalUrl.ts";

test("isRevenueCatPortalUrl accepts RevenueCat's https hosts", () => {
  for (const value of [
    "https://billing.revenuecat.com/customer-portal/abc?token=x",
    "https://pay.rev.cat/portal/abc",
    "https://revenuecat.com/portal",
  ]) {
    assert.equal(isRevenueCatPortalUrl(value), true, value);
  }
});

test("isRevenueCatPortalUrl refuses anything else", () => {
  for (const value of [
    "http://billing.revenuecat.com/portal",
    "https://evil.com/?revenuecat.com",
    "https://revenuecat.com.evil.com/portal",
    "https://evilrevenuecat.com/portal",
    "https://user:pass@billing.revenuecat.com/portal",
    "https://billing.revenuecat.com:8443/portal",
    "javascript:alert(1)",
    "//billing.revenuecat.com/portal",
    "not a url",
    "",
  ]) {
    assert.equal(isRevenueCatPortalUrl(value), false, value);
  }
});
