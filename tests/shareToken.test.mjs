// Unit tests for shared meal plan link tokens (PRE-377). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { isShareToken, sharedMealPlansEnabled } from "../src/lib/share-token.ts";

test("isShareToken refuses database ids and short or odd values", () => {
  for (const value of [
    "65f0000000000000000156a0",
    "0000000000000000000205a1",
    "short",
    "",
    "a".repeat(31),
    "a".repeat(65),
    "abc/def".padEnd(40, "x"),
    "has space".padEnd(40, "x"),
    "%2e%2e".padEnd(40, "x"),
  ]) {
    assert.equal(isShareToken(value), false, value);
  }
});

test("isShareToken accepts base64url tokens of 128 bits or more", () => {
  assert.equal(isShareToken("Q2hlY2tpbmcgYSBzaGFyZSB0b2tlbiBoZXJl"), true);
  assert.equal(isShareToken("a-b_".repeat(8)), true);
  assert.equal(isShareToken("x".repeat(64)), true);
});

test("shared plan lookups stay off unless explicitly enabled", () => {
  assert.equal(sharedMealPlansEnabled({}), false);
  assert.equal(sharedMealPlansEnabled({ SHARED_MEAL_PLANS_ENABLED: "1" }), false);
  assert.equal(sharedMealPlansEnabled({ SHARED_MEAL_PLANS_ENABLED: "false" }), false);
  assert.equal(sharedMealPlansEnabled({ SHARED_MEAL_PLANS_ENABLED: "true" }), true);
});
