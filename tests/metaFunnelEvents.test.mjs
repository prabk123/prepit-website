// Unit tests for which web funnel events reach Meta as custom events (PRE-569). Run with `yarn test`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { META_FUNNEL_EVENTS, metaFunnelEvent } from "../src/lib/metaFunnelEvents.ts";

const funnelSource = readFileSync(new URL("../src/lib/webFunnelAnalytics.ts", import.meta.url), "utf8");
const postHogNames = new Set([...funnelSource.matchAll(/^\s+\w+: "([a-z_]+)",$/gm)].map((m) => m[1]));

test("every Meta funnel event is a real PostHog web funnel event, under the same name", () => {
  assert.ok(postHogNames.size > 40);
  for (const name of META_FUNNEL_EVENTS) assert.ok(postHogNames.has(name), name);
});

test("the main funnel steps go to Meta", () => {
  for (const name of [
    "quiz_completed",
    "cart_view",
    "web_signin_start",
    "web_signup_success",
    "web_paywall_view",
    "web_checkout_start",
    "web_checkout_success",
    "web_checkout_failed",
    "web_handoff_view",
  ]) {
    assert.equal(metaFunnelEvent(name, {}, "/start")?.name, name);
  }
});

test("stop screens, health consent, privacy, account, connector and internal events never go to Meta", () => {
  for (const name of [
    "web_quiz_ended",
    "web_privacy_consent_change",
    "web_privacy_consent_needed",
    "web_privacy_consent_learn_more",
    "web_meta_matching_sent",
    "auth_start",
    "auth_cancel",
    "web_lead_plan_view",
    "web_lead_preferences_action",
    "web_manage_subscription_view",
    "web_contract_withdrawal_view",
    "web_connect_view",
    "web_privacy_choices_view",
    "web_privacy_choice_change",
  ]) {
    assert.equal(metaFunnelEvent(name, { plan: "annual" }, "/start"), null, name);
  }
});

test("only allowed fixed codes are kept; campaign tags, timings, errors and unknown keys are dropped", () => {
  const meta = metaFunnelEvent("web_paywall_view", {
    plan: "annual",
    has_trial: true,
    step_index: 3,
    step_id: "paywall",
    utm_source: "facebook",
    load_account_ms: 120,
    rc_error_code: "x",
    email: "someone@example.com",
    error: "boom",
    reason: null,
    entry: "",
    market: "uk",
  }, "/start");
  assert.deepEqual(meta, { name: "web_paywall_view", params: { plan: "annual", has_trial: true, step_id: "paywall", market: "uk" } });
});

test("checkout success carries no value or currency, so Meta can't read it as a purchase", () => {
  const meta = metaFunnelEvent("web_checkout_success", { plan: "annual", value: 99.99, currency: "USD" }, "/start");
  assert.deepEqual(meta, { name: "web_checkout_success", params: { plan: "annual" } });
});

test("only the quiz's first screen goes to Meta, without an index; stop screens and answer-dependent screens never do", () => {
  const base = { funnel_id: "quiz", funnel_version: "quiz-v4" };
  assert.deepEqual(metaFunnelEvent("web_quiz_step_view", { ...base, step_id: "goal", step_index: 0 }, "/quiz"), {
    name: "web_quiz_step_view",
    params: { ...base, step_id: "goal" },
  });
  for (const step_id of ["stop", "numbers", "safety", "goalweight", "loader", "echo-plans"]) {
    assert.equal(metaFunnelEvent("web_quiz_step_view", { ...base, step_id, step_index: 5 }, "/quiz"), null, step_id);
  }
});

test("sign-in on the account, withdraw, connect and privacy choices pages never goes to Meta", () => {
  for (const page of ["/account", "/account/", "/withdraw", "/connect", "/connect/claude", "/privacy-choices"]) {
    for (const name of ["web_signin_start", "web_signin_failed", "web_signin_cancelled", "web_signup_success"]) {
      assert.equal(metaFunnelEvent(name, { signup_method: "google" }, page), null, `${name} ${page}`);
    }
  }
  for (const page of ["/start", "/checkout", "/welcome", "/signin", "/accounting"]) {
    assert.equal(metaFunnelEvent("web_signin_start", { signup_method: "google" }, page)?.name, "web_signin_start", page);
  }
});
