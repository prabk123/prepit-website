// Unit tests for the UK and EEA right-to-cancel consent at checkout. Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { WITHDRAWAL_CONSENT_VERSION, withdrawalConsentAttributes } from "../src/lib/withdrawalConsent.ts";

test("the record has the time, wording version and country", () => {
  const now = new Date("2026-10-21T14:30:00.000Z");
  assert.deepEqual(withdrawalConsentAttributes(" gb ", now), {
    withdrawal_waiver_at: "2026-10-21T14:30:00.000Z",
    withdrawal_waiver_version: WITHDRAWAL_CONSENT_VERSION,
    withdrawal_waiver_country: "GB",
  });
  assert.equal(withdrawalConsentAttributes(null, now).withdrawal_waiver_country, "unknown");
});
