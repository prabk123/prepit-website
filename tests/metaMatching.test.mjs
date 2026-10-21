// Unit tests for the Meta matching details given to RevenueCat on checkout. Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanIpAddress, fbcFromClickId, metaMatchingAttributes } from "../src/lib/metaMatching.ts";

const NOW = 1_760_000_000_000;

test("keeps the pixel cookies, email, user agent and the page without its query", () => {
  const result = metaMatchingAttributes({
    fbpCookie: "fb.1.1759999999999.123456789",
    fbcCookie: "fb.1.1759999999999.AbCdEf",
    fbclid: "Ignored",
    email: " person@example.com ",
    ip: "203.0.113.7",
    userAgent: "Mozilla/5.0 (iPhone)",
    pageUrl: "https://www.tryprepit.app/checkout?funnel=quiz&plan=annual",
    now: NOW,
  });
  assert.deepEqual(result, {
    identity: { $email: "person@example.com", $ip: "203.0.113.7" },
    ids: {
      $fbp: "fb.1.1759999999999.123456789",
      $fbc: "fb.1.1759999999999.AbCdEf",
    },
    browser: {
      $userAgent: "Mozilla/5.0 (iPhone)",
      $pageUrl: "https://www.tryprepit.app/checkout",
    },
  });
});

test("builds fbc from the stored ad click id when there is no _fbc cookie", () => {
  const { ids } = metaMatchingAttributes({ fbclid: "IwAR0abc", now: NOW });
  assert.equal(ids.$fbc, `fb.1.${NOW}.IwAR0abc`);
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
  assert.deepEqual(result, { identity: {}, ids: {}, browser: {} });
});

test("decodes an encoded cookie value", () => {
  const { ids } = metaMatchingAttributes({ fbpCookie: "fb.1.1759999999999.123%2B4", now: NOW });
  assert.equal(ids.$fbp, "fb.1.1759999999999.123+4");
});

test("keeps only real IPv4 and IPv6 addresses", () => {
  assert.equal(cleanIpAddress(" 203.0.113.7 "), "203.0.113.7");
  assert.equal(cleanIpAddress("2001:db8::1"), "2001:db8::1");
  assert.equal(cleanIpAddress("999.1.1.1"), undefined);
  assert.equal(cleanIpAddress("abc"), undefined);
  assert.equal(cleanIpAddress("<script>"), undefined);
  assert.equal(cleanIpAddress(undefined), undefined);
});
