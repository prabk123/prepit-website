// Unit tests for funnel attribution and the web sign-up save body (PRE-266, PRE-302). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { attributionEventProperties, cleanReferrer, parseAttribution } from "../src/lib/funnel/attribution.ts";
import { buildWebSignupBody } from "../src/lib/funnel/webSignupProfile.ts";

const HOST = "www.tryprepit.app";

test("parseAttribution keeps UTM parameters, click ids, referrer and landing path", () => {
  const attribution = parseAttribution(
    "?utm_source=meta&utm_medium=paid&utm_campaign=oct-lose-weight&utm_term=nutritionist&utm_content=video-1&fbclid=AbC123&gclid=g1&ttclid=t1&plan=annual",
    "/start",
    "https://l.instagram.com/some/path?u=secret",
    HOST,
  );
  assert.deepEqual(attribution, {
    utmSource: "meta",
    utmMedium: "paid",
    utmCampaign: "oct-lose-weight",
    utmTerm: "nutritionist",
    utmContent: "video-1",
    fbclid: "AbC123",
    gclid: "g1",
    ttclid: "t1",
    referrer: "https://l.instagram.com",
    landingPath: "/start",
  });
});

test("parseAttribution keeps nothing for a visit with no campaign from our own site", () => {
  assert.equal(parseAttribution("?plan=annual", "/signin", "https://www.tryprepit.app/pricing", HOST), null);
  assert.equal(parseAttribution("", "/", "", HOST), null);
  assert.equal(parseAttribution("?utm_source=%20%20", "/", "", HOST), null);
});

test("parseAttribution trims and caps values at the backend's limits", () => {
  const attribution = parseAttribution(`?utm_source=${"a".repeat(300)}&fbclid=${"b".repeat(600)}`, "/", "", HOST);
  assert.equal(attribution.utmSource.length, 200);
  assert.equal(attribution.fbclid.length, 500);
});

test("parseAttribution drops values that look like an email address", () => {
  const attribution = parseAttribution("?utm_source=newsletter&utm_content=jo%40example.com&utm_campaign=hi@x.co", "/", "", HOST);
  assert.deepEqual(attribution, { utmSource: "newsletter", landingPath: "/" });
});

test("cleanReferrer keeps the origin only and skips our own, payment and sign-in hosts", () => {
  assert.equal(cleanReferrer("https://www.google.com/", HOST), "https://www.google.com");
  assert.equal(cleanReferrer("https://www.google.com/search?q=private", HOST), "https://www.google.com");
  assert.equal(cleanReferrer("https://mail.example.com/u/0/inbox/18c2a1f", HOST), "https://mail.example.com");
  for (const host of [
    "https://pay.rev.cat/abc",
    "https://billing.revenuecat.com/",
    "https://checkout.stripe.com/c/pay",
    "https://appleid.apple.com/auth/authorize",
    "https://accounts.google.com/o/oauth2",
    "https://fresca-dev.firebaseapp.com/__/auth/handler",
  ]) {
    assert.equal(cleanReferrer(host, HOST), undefined, host);
  }
  assert.equal(cleanReferrer("https://www.apple.com/", HOST), "https://www.apple.com");
  assert.equal(cleanReferrer("https://tryprepit.app/features", HOST), undefined);
  assert.equal(cleanReferrer("http://localhost:3100/", "localhost:3100"), undefined);
  assert.equal(cleanReferrer("android-app://com.google.android.gm/", HOST), undefined);
  assert.equal(cleanReferrer("not a url", HOST), undefined);
});

test("attributionEventProperties sends campaign names only, never click ids", () => {
  assert.deepEqual(
    attributionEventProperties({ utmSource: "meta", utmCampaign: "oct", fbclid: "x", gclid: "y", referrer: "https://a.com" }),
    { utm_source: "meta", utm_campaign: "oct" },
  );
  assert.deepEqual(attributionEventProperties(null), {});
});

test("buildWebSignupBody drops bad answers, keeps the latest per question and caps at 100", () => {
  const answers = [
    { questionId: "goal", questionText: "What's your goal?", answer: "lose_weight" },
    { questionId: "bad id!", answer: "x" },
    { questionId: "weight", answer: Number.NaN },
    { questionId: "goal", answer: "gain_muscle" },
    { questionId: "blockers", answer: ["snacking", 3, { nope: true }] },
    ...Array.from({ length: 120 }, (_, i) => ({ questionId: `q${i}`, answer: i })),
  ];
  const body = buildWebSignupBody({ funnelId: "start", answers, createAccount: false });
  assert.equal(body.funnelId, "start");
  assert.equal(body.createAccount, false);
  assert.equal(body.answers.length, 100);
  assert.ok(!body.answers.some((a) => a.questionId === "bad id!" || a.questionId === "weight"));
  assert.equal(body.answers.at(-1).questionId, "q119");

  const few = buildWebSignupBody({ answers: answers.slice(0, 5) });
  assert.deepEqual(few.answers, [
    { questionId: "goal", answer: "gain_muscle" },
    { questionId: "blockers", answer: ["snacking", 3] },
  ]);
});

test("buildWebSignupBody leaves out empty parts", () => {
  assert.deepEqual(buildWebSignupBody({ funnelId: "direct-sale", attribution: null, user: {}, settings: {} }), {
    funnelId: "direct-sale",
  });
});

test("buildWebSignupBody keeps only account fields and settings the backend accepts", () => {
  const body = buildWebSignupBody({
    funnelId: "   ",
    user: { dob: "1992-05-14", gender: "female", height: 400, weight: 72 },
    settings: {
      goal: " Lose Weight ",
      goalWeight: 5,
      goalSpeed: 0.5,
      diet: "carnivore",
      intolerances: ["gluten", " ", "x".repeat(300)],
      unit: "metric",
    },
  });
  assert.equal(body.funnelId, undefined);
  assert.deepEqual(body.user, { dob: "1992-05-14", gender: "female", weight: 72 });
  assert.deepEqual(body.settings, {
    goal: "lose weight",
    goalSpeed: 0.5,
    intolerances: ["gluten", "x".repeat(200)],
    unit: "metric",
  });
  assert.equal(buildWebSignupBody({ user: { dob: "2999-01-01", gender: "robot" } }).user, undefined);
});
