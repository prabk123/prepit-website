// Unit tests for the shared bridge handoff (PRE-323) and the in-app browser escape (PRE-324). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBridgeHandoff, parseBridgeVisit } from "../src/lib/funnel/bridgeHandoff.ts";
import { bridgePath, parseBridgeSource } from "../src/lib/funnel/params.ts";
import { buildWebSignupBody } from "../src/lib/funnel/webSignupProfile.ts";

test("bridgePath builds the one bridge route", () => {
  assert.equal(bridgePath({ from: "landing", plan: "annual", funnel: "direct-sale" }), "/start?from=landing&plan=annual&funnel=direct-sale");
  assert.equal(bridgePath({ from: "quiz" }), "/start?from=quiz&funnel=direct-sale");
  assert.equal(bridgePath({ from: "quiz", funnel: "Not A Slug" }), "/start?from=quiz&funnel=direct-sale");
});

test("parseBridgeSource defaults to the landing page", () => {
  assert.equal(parseBridgeSource("quiz"), "quiz");
  assert.equal(parseBridgeSource("landing"), "landing");
  assert.equal(parseBridgeSource("evil"), "landing");
  assert.equal(parseBridgeSource(null), "landing");
});

test("parseBridgeHandoff keeps known fields and drops stale or broken ones", () => {
  const now = Date.parse("2026-10-21T09:00:00Z");
  const raw = JSON.stringify({
    funnelId: "quiz",
    funnelVersion: "v3",
    answers: [{ questionId: "goal", answer: "lose weight" }],
    user: { weight: 72 },
    settings: { goal: "lose weight" },
    firstName: "  Jo ",
    email: "jo@example.com",
    planSummary: { tags: [" Lose fat ", 3, ""], calories: 1610.4, proteinGrams: -5 },
    startingPoint: "dip_breakfast",
    extra: "ignored",
    savedAt: now - 1000,
  });
  const handoff = parseBridgeHandoff(raw, now);
  assert.deepEqual(handoff, {
    funnelId: "quiz",
    funnelVersion: "v3",
    answers: [{ questionId: "goal", answer: "lose weight" }],
    user: { weight: 72 },
    settings: { goal: "lose weight" },
    firstName: "Jo",
    email: "jo@example.com",
    planSummary: { tags: ["Lose fat"], calories: 1610, proteinGrams: undefined },
    startingPoint: "dip_breakfast",
  });
  assert.equal(parseBridgeHandoff(JSON.stringify({ funnelId: "quiz", startingPoint: "evil", savedAt: now }), now)?.startingPoint, undefined);
  assert.equal(parseBridgeHandoff(JSON.stringify({ funnelId: "quiz", savedAt: now - 31 * 86400000 }), now), null);
  assert.equal(parseBridgeHandoff("{not json", now), null);
  assert.equal(parseBridgeHandoff(JSON.stringify({ savedAt: now }), now), null);
  assert.equal(parseBridgeHandoff(null, now), null);
});

test("buildWebSignupBody sends a valid webSessionId and the quiz name", () => {
  const body = buildWebSignupBody({ funnelId: "quiz", webSessionId: "ws_abc12345", user: { firstName: " Jo " } });
  assert.equal(body.webSessionId, "ws_abc12345");
  assert.deepEqual(body.user, { firstName: "Jo" });
  assert.equal(buildWebSignupBody({ webSessionId: "short" }).webSessionId, undefined);
  assert.equal(buildWebSignupBody({ webSessionId: "has spaces in it" }).webSessionId, undefined);
  assert.equal(buildWebSignupBody({ user: { firstName: "  " } }).user, undefined);
});

test("parseBridgeVisit keeps a valid visit only", () => {
  assert.deepEqual(parseBridgeVisit(JSON.stringify({ from: "quiz", trial: false })), { from: "quiz", trial: false });
  assert.equal(parseBridgeVisit(JSON.stringify({ from: "evil", trial: true })), null);
  assert.equal(parseBridgeVisit(JSON.stringify({ from: "landing" })), null);
  assert.equal(parseBridgeVisit("{bad"), null);
  assert.equal(parseBridgeVisit(null), null);
});

test("privacy consent (PRE-533): a stored tick parses back and goes in the save body", async () => {
  const { parsePrivacyConsent, privacyConsentBody, PRIVACY_CONSENT_VERSION, PRIVACY_CONSENT_TEXT } = await import(
    "../src/lib/funnel/privacyConsent.ts"
  );
  // The exact health-ai-v1 sentence the backend stores (fresca_backend privacyConsentWording.ts).
  assert.equal(PRIVACY_CONSENT_TEXT, "I agree PrepIt can use my health info, and share it with its AI providers, to coach me.");
  const now = Date.parse("2026-11-15T20:00:00Z");
  const stored = parsePrivacyConsent(JSON.stringify({ version: PRIVACY_CONSENT_VERSION, givenAt: "2026-11-15T19:55:00Z" }), now);
  assert.deepEqual(stored, { version: "health-ai-v1", givenAt: "2026-11-15T19:55:00.000Z" });
  assert.deepEqual(privacyConsentBody(stored), {
    version: "health-ai-v1",
    healthData: true,
    aiProviders: true,
    givenAt: "2026-11-15T19:55:00.000Z",
  });
  assert.equal(privacyConsentBody(null), undefined);
  const body = buildWebSignupBody({ funnelId: "quiz", privacyConsent: privacyConsentBody(stored) });
  assert.deepEqual(body.privacyConsent, { version: "health-ai-v1", healthData: true, aiProviders: true, givenAt: "2026-11-15T19:55:00.000Z" });
  assert.equal(body.privacyConsent.source, undefined);
});

test("privacy consent (PRE-533): stale, future, other-version or broken ticks are dropped", async () => {
  const { parsePrivacyConsent } = await import("../src/lib/funnel/privacyConsent.ts");
  const now = Date.parse("2026-11-15T20:00:00Z");
  assert.equal(parsePrivacyConsent(null, now), null);
  assert.equal(parsePrivacyConsent("not json", now), null);
  assert.equal(parsePrivacyConsent(JSON.stringify({ version: "health-ai-v0", givenAt: "2026-11-15T19:55:00Z" }), now), null);
  assert.equal(parsePrivacyConsent(JSON.stringify({ version: "health-ai-v1", givenAt: "2026-09-01T00:00:00Z" }), now), null);
  // Kept for an hour at most, so an abandoned tick never pre-ticks the box for the next visitor.
  assert.notEqual(parsePrivacyConsent(JSON.stringify({ version: "health-ai-v1", givenAt: "2026-11-15T19:01:00Z" }), now), null);
  assert.equal(parsePrivacyConsent(JSON.stringify({ version: "health-ai-v1", givenAt: "2026-11-15T18:59:00Z" }), now), null);
  assert.equal(parsePrivacyConsent(JSON.stringify({ version: "health-ai-v1", givenAt: "2026-11-16T20:00:00Z" }), now), null);
  assert.equal(parsePrivacyConsent(JSON.stringify({ version: "health-ai-v1" }), now), null);
  // The body builder only sends the version the box showed, with both purposes agreed.
  assert.equal(buildWebSignupBody({ privacyConsent: { version: "other", healthData: true, aiProviders: true, givenAt: "x" } }).privacyConsent, undefined);
  assert.equal(buildWebSignupBody({}).privacyConsent, undefined);
});
