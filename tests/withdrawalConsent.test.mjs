// Unit tests for the UK and EEA "start my access now" box (PRE-356). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clearedWithdrawalConsentAttributes,
  parseStartNowChoice,
  startNowChoice,
  WITHDRAWAL_CONSENT_TEXT,
  WITHDRAWAL_CONSENT_VERSION,
  withdrawalConsentAttributes,
} from "../src/lib/withdrawalConsent.ts";

test("the record has the time, wording version and country", () => {
  const now = new Date("2026-10-21T14:30:00.000Z");
  assert.deepEqual(withdrawalConsentAttributes(" gb ", now), {
    withdrawal_waiver_at: "2026-10-21T14:30:00.000Z",
    withdrawal_waiver_version: WITHDRAWAL_CONSENT_VERSION,
    withdrawal_waiver_country: "GB",
  });
  assert.equal(withdrawalConsentAttributes(null, now).withdrawal_waiver_country, "unknown");
});

test("a stored start-now answer comes back only with the current wording", () => {
  const now = new Date("2026-10-23T15:00:00.000Z");
  const ticked = startNowChoice(true, "start", now);
  assert.deepEqual(parseStartNowChoice(JSON.stringify(ticked)), {
    startNow: true,
    at: "2026-10-23T15:00:00.000Z",
    version: WITHDRAWAL_CONSENT_VERSION,
    askedOn: "start",
  });
  const unticked = startNowChoice(false, "signin", now);
  assert.deepEqual(parseStartNowChoice(JSON.stringify(unticked)), {
    startNow: false,
    at: null,
    version: WITHDRAWAL_CONSENT_VERSION,
    askedOn: "signin",
  });
  assert.equal(parseStartNowChoice(JSON.stringify({ ...ticked, version: "2026-10-21" })), null);
  assert.equal(parseStartNowChoice(JSON.stringify({ ...ticked, at: null })), null);
  assert.equal(parseStartNowChoice(JSON.stringify({ ...ticked, askedOn: "elsewhere" })), null);
  assert.equal(parseStartNowChoice("not json"), null);
  assert.equal(parseStartNowChoice(null), null);
});

test("the wording says access starts now and the used days are paid for, not that the right is lost", () => {
  assert.match(WITHDRAWAL_CONSENT_TEXT, /^Start my access now\./);
  assert.match(WITHDRAWAL_CONSENT_TEXT, /14-day/);
  assert.match(WITHDRAWAL_CONSENT_TEXT, /days I've used/);
  assert.doesNotMatch(WITHDRAWAL_CONSENT_TEXT, /lose/);
});

test("an unticked box clears all three attributes", () => {
  const cleared = clearedWithdrawalConsentAttributes();
  assert.deepEqual(Object.keys(cleared).sort(), Object.keys(withdrawalConsentAttributes("GB", new Date())).sort());
  assert.ok(Object.values(cleared).every((value) => value === null));
});
