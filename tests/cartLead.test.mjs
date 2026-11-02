// Unit tests for "Not ready? Email me my plan" on the cart (PRE-439). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { cartLeadCountry, cartLeadInput, isCartEmailPlanEnabled, showCartEmailPlan } from "../src/lib/funnel/cartLead.ts";

const HANDOFF = {
  funnelId: "quiz",
  funnelVersion: "9.2",
  answers: [{ questionId: "goal", answer: "lose weight" }],
  user: { gender: "female", height: 168, weight: 72, dob: "1992-05-14" },
  settings: { goal: "lose weight", unit: "imperial" },
  email: "jo@example.com",
  planSummary: { calories: 1650, proteinGrams: 120 },
  startingPoint: "dip",
};

test("the link is off until the plan email can go out", () => {
  assert.equal(isCartEmailPlanEnabled(undefined), false);
  assert.equal(isCartEmailPlanEnabled(""), false);
  assert.equal(isCartEmailPlanEnabled("off"), false);
  assert.equal(isCartEmailPlanEnabled(" ON "), true);
});

test("quiz entry only, and only with the quiz's answers", () => {
  assert.equal(showCartEmailPlan("quiz", HANDOFF, true), true);
  assert.equal(showCartEmailPlan("quiz", HANDOFF, false), false);
  assert.equal(showCartEmailPlan("landing", HANDOFF, true), false);
  assert.equal(showCartEmailPlan("quiz", null, true), false);
  assert.equal(showCartEmailPlan("quiz", { funnelId: "quiz" }, true), false);
  assert.equal(showCartEmailPlan("quiz", { funnelId: "quiz", answers: [], user: {}, settings: {} }, true), false);
  assert.equal(showCartEmailPlan("quiz", { funnelId: "quiz", settings: { goal: "maintain" } }, true), true);
});

test("the country is the geo header's, US when there is none", () => {
  assert.equal(cartLeadCountry("gb"), "GB");
  assert.equal(cartLeadCountry(null), "US");
  assert.equal(cartLeadCountry("not a country"), "US");
});

test("the lead carries the quiz's answers, marked as from the cart, and nothing for display only", () => {
  const input = cartLeadInput({
    handoff: HANDOFF,
    email: "  jo@example.com ",
    marketingConsent: false,
    consentText: "Send me tips and offers from PrepIt. Unsubscribe any time.",
    webSessionId: "quiz-session-0001",
    country: "gb",
    attribution: { utmSource: "meta" },
  });
  assert.deepEqual(input, {
    webSessionId: "quiz-session-0001",
    email: "jo@example.com",
    marketingConsent: false,
    consentText: "Send me tips and offers from PrepIt. Unsubscribe any time.",
    country: "GB",
    funnelId: "quiz",
    funnelVersion: "9.2",
    source: "cart",
    answers: HANDOFF.answers,
    user: HANDOFF.user,
    settings: HANDOFF.settings,
    attribution: { utmSource: "meta" },
  });
  // The plan card's summary and starting point are for display, not the lead.
  assert.equal("planSummary" in input, false);
  assert.equal("startingPoint" in input, false);
});
