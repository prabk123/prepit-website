// Unit tests for the website's security headers (PRE-379). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { FIREBASE_AUTH_HANDLER_SOURCES } from "../src/lib/firebase/authHandler.ts";
import { httpsOrigin, securityHeaderRules } from "../src/lib/securityHeaders.ts";

const valuesOf = (rule) => Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));

// Next.js sends the value from the last matching rule, the same way.
function headersFor(path, posthogUiHost) {
  const rules = securityHeaderRules(FIREBASE_AUTH_HANDLER_SOURCES, posthogUiHost);
  const matches = (source) => source === "/:path*" || path.startsWith(source.replace("/:path*", "/"));
  return rules.filter((rule) => matches(rule.source)).reduce((acc, rule) => ({ ...acc, ...valuesOf(rule) }), {});
}

test("every path gets the security headers first, then the sign-in handler overrides", () => {
  const rules = securityHeaderRules(FIREBASE_AUTH_HANDLER_SOURCES);
  assert.equal(rules[0].source, "/:path*");
  assert.deepEqual(rules.slice(1).map((rule) => rule.source), [...FIREBASE_AUTH_HANDLER_SOURCES]);
});

test("pages can't be framed at all without a PostHog UI host, including /withdraw", () => {
  for (const path of ["/", "/withdraw", "/checkout", "/account"]) {
    const headers = headersFor(path);
    assert.equal(headers["Content-Security-Policy"], "frame-ancestors 'none'", path);
    assert.equal(headers["X-Frame-Options"], "DENY", path);
  }
});

test("PostHog's app can frame pages for heatmaps; no other site can", () => {
  assert.equal(headersFor("/withdraw", "https://us.posthog.com/")["Content-Security-Policy"], "frame-ancestors https://us.posthog.com");
  assert.equal(headersFor("/", "https://eu.posthog.com/project/1")["Content-Security-Policy"], "frame-ancestors https://eu.posthog.com");
});

test("Firebase's sign-in frame can be framed by our own pages", () => {
  const headers = headersFor("/__/auth/iframe");
  assert.equal(headers["Content-Security-Policy"], "frame-ancestors 'self'");
  assert.equal(headers["X-Frame-Options"], "SAMEORIGIN");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headersFor("/__/auth/iframe", "https://us.posthog.com")["Content-Security-Policy"], "frame-ancestors 'self' https://us.posthog.com");
});

test("a UI host that isn't an https URL is ignored", () => {
  for (const value of [undefined, "", "  ", "not a url", "http://us.posthog.com", "javascript:alert(1)", "https://x.com; script-src *"]) {
    const csp = headersFor("/", value)["Content-Security-Policy"];
    assert.ok(csp === "frame-ancestors 'none'" || csp === `frame-ancestors ${httpsOrigin(value)}`, `${value} -> ${csp}`);
    assert.doesNotMatch(csp, /;|script-src|http:/);
  }
});

test("the CSP only sets frame-ancestors, so checkout, sign-in, images and analytics aren't limited", () => {
  for (const rule of securityHeaderRules(FIREBASE_AUTH_HANDLER_SOURCES, "https://us.posthog.com")) {
    const directives = valuesOf(rule)["Content-Security-Policy"].split(";").map((d) => d.trim().split(/\s+/)[0]).filter(Boolean);
    assert.deepEqual(directives, ["frame-ancestors"]);
  }
});

test("nosniff, referrer policy and HSTS without subdomains or preload", () => {
  const headers = headersFor("/");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.match(headers["Strict-Transport-Security"], /^max-age=\d+$/);
  assert.ok(Number(headers["Strict-Transport-Security"].split("=")[1]) >= 31536000);
});
