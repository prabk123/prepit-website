// Unit tests for the web paywall's load timings and warm-up helpers (PRE-464). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { CHECKOUT_STEPS, createCheckoutTimer } from "../src/lib/funnel/checkoutTimings.ts";
import { paywallFontUrls } from "../src/lib/revenuecat/paywallWarmup.ts";

function clock() {
  let now = 1000;
  return { now: () => now, advance: (ms) => (now += ms) };
}

test("every step is reported, null until it happens", () => {
  const c = clock();
  const timer = createCheckoutTimer(c.now);
  timer.start("uid-1");
  const props = timer.properties("uid-1");
  assert.deepEqual(Object.keys(props), CHECKOUT_STEPS.map((step) => `load_${step}_ms`));
  assert.ok(Object.values(props).every((value) => value === null));
});

test("steps are milliseconds since sign-in, and only the first time counts", () => {
  const c = clock();
  const timer = createCheckoutTimer(c.now);
  timer.start("uid-1");
  c.advance(420.4);
  timer.mark("uid-1", "rc_ready");
  c.advance(300);
  timer.mark("uid-1", "account");
  timer.mark("uid-1", "rc_ready");
  const props = timer.properties("uid-1");
  assert.equal(props.load_rc_ready_ms, 420);
  assert.equal(props.load_account_ms, 720);
  assert.equal(props.load_paywall_drawn_ms, null);
});

test("starting again for the same uid keeps the clock; another uid starts over", () => {
  const c = clock();
  const timer = createCheckoutTimer(c.now);
  timer.start("uid-1");
  c.advance(500);
  timer.start("uid-1");
  timer.mark("uid-1", "offering");
  assert.equal(timer.properties("uid-1").load_offering_ms, 500);
  timer.start("uid-2");
  c.advance(100);
  timer.mark("uid-1", "account");
  timer.mark("uid-2", "account");
  assert.equal(timer.properties("uid-2").load_account_ms, 100);
  assert.equal(timer.properties("uid-1").load_account_ms, null, "another uid's timings are never reported");
});

test("a step marked before the clock started is ignored", () => {
  const timer = createCheckoutTimer(clock().now);
  timer.mark("uid-1", "account");
  timer.start("uid-1");
  assert.equal(timer.properties("uid-1").load_account_ms, null);
});

test("the paywall's font files come from the offering's ui_config", () => {
  const offering = {
    uiConfig: {
      app: {
        fonts: {
          "RCFM:a:DMSans-Regular": { web: { family: "DM Sans", url: "https://fonts.pawwalls.com/a.ttf" } },
          "RCFM:b:DMSans-Bold": { web: { family: "DM Sans", url: "https://fonts.pawwalls.com/b.ttf" } },
          "RCFM:c:Same": { web: { family: "DM Sans", url: "https://fonts.pawwalls.com/a.ttf" } },
          "RCFM:d:NameOnly": { web: { type: "name" } },
          "RCFM:e:Plain": { web: { url: "http://example.com/x.ttf" } },
          "RCFM:f:Broken": null,
        },
      },
    },
  };
  assert.deepEqual(paywallFontUrls(offering), ["https://fonts.pawwalls.com/a.ttf", "https://fonts.pawwalls.com/b.ttf"]);
});

test("an offering without ui_config fonts gives no font files", () => {
  assert.deepEqual(paywallFontUrls(null), []);
  assert.deepEqual(paywallFontUrls({}), []);
  assert.deepEqual(paywallFontUrls({ uiConfig: { app: { fonts: "nope" } } }), []);
});
