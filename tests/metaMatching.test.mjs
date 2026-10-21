// Unit tests for the Meta matching details given to RevenueCat on checkout. Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fbcFromClickId, metaMatchingAttributes } from "../src/lib/metaMatching.ts";

const NOW = 1_760_000_000_000;

test("keeps the pixel cookies, email, user agent and the page without its query", () => {
  const result = metaMatchingAttributes({
    fbpCookie: "fb.1.1759999999999.123456789",
    fbcCookie: "fb.1.1759999999999.AbCdEf",
    fbclid: "Ignored",
    email: " person@example.com ",
    userAgent: "Mozilla/5.0 (iPhone)",
    pageUrl: "https://www.tryprepit.app/checkout?funnel=quiz&plan=annual",
    now: NOW,
  });
  assert.deepEqual(result, {
    identity: { $email: "person@example.com" },
    browser: {
      $fbp: "fb.1.1759999999999.123456789",
      $fbc: "fb.1.1759999999999.AbCdEf",
      $userAgent: "Mozilla/5.0 (iPhone)",
      $pageUrl: "https://www.tryprepit.app/checkout",
    },
  });
});

test("builds fbc from the stored ad click id when there is no _fbc cookie", () => {
  const { browser } = metaMatchingAttributes({ fbclid: "IwAR0abc", now: NOW });
  assert.equal(browser.$fbc, `fb.1.${NOW}.IwAR0abc`);
  assert.equal(fbcFromClickId("  ", NOW), undefined);
  assert.equal(fbcFromClickId(undefined, NOW), undefined);
});

test("drops values that aren't Meta's cookie format, and an email without @", () => {
  const result = metaMatchingAttributes({
    fbpCookie: "not-a-cookie",
    fbcCookie: "",
    email: "nobody",
    pageUrl: "javascript:alert(1)",
    now: NOW,
  });
  assert.deepEqual(result, { identity: {}, browser: {} });
});

test("decodes an encoded cookie value", () => {
  const { browser } = metaMatchingAttributes({ fbpCookie: "fb.1.1759999999999.123%2B4", now: NOW });
  assert.equal(browser.$fbp, "fb.1.1759999999999.123+4");
});
