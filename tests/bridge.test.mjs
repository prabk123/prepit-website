// Unit tests for the shared bridge handoff (PRE-323) and the in-app browser escape (PRE-324). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBridgeHandoff } from "../src/lib/funnel/bridgeHandoff.ts";
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
  });
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
