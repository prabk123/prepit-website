// Unit tests for the website's security headers (PRE-379). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { SECURITY_HEADERS, securityHeadersRule } from "../src/lib/securityHeaders.ts";

const byKey = Object.fromEntries(SECURITY_HEADERS.map(({ key, value }) => [key, value]));

test("the rule covers every path", () => {
  assert.equal(securityHeadersRule().source, "/:path*");
  assert.deepEqual(securityHeadersRule().headers, [...SECURITY_HEADERS]);
});

test("other sites can't frame our pages, but Firebase's same-origin sign-in frame still loads", () => {
  assert.equal(byKey["Content-Security-Policy"], "frame-ancestors 'self'");
  assert.equal(byKey["X-Frame-Options"], "SAMEORIGIN");
});

test("the CSP only sets frame-ancestors, so checkout, sign-in and analytics scripts aren't limited", () => {
  const directives = byKey["Content-Security-Policy"].split(";").map((d) => d.trim().split(/\s+/)[0]).filter(Boolean);
  assert.deepEqual(directives, ["frame-ancestors"]);
});

test("nosniff, referrer policy and HSTS without subdomains or preload", () => {
  assert.equal(byKey["X-Content-Type-Options"], "nosniff");
  assert.equal(byKey["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.match(byKey["Strict-Transport-Security"], /^max-age=\d+$/);
  assert.ok(Number(byKey["Strict-Transport-Security"].split("=")[1]) >= 31536000);
});
