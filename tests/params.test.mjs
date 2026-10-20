// Unit tests for the Web2App query parameters. Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFunnelId, safeNextPath } from "../src/lib/funnel/params.ts";

const FALLBACK = "/checkout";

test("safeNextPath keeps same-site paths and their query", () => {
  assert.equal(safeNextPath("/checkout?plan=annual&funnel=start", FALLBACK), "/checkout?plan=annual&funnel=start");
  assert.equal(safeNextPath("/account", FALLBACK), "/account");
});

test("safeNextPath refuses other sites", () => {
  for (const value of [
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "javascript:alert(1)",
    "evil.com",
    "",
    null,
    undefined,
  ]) {
    assert.equal(safeNextPath(value, FALLBACK), FALLBACK, String(value));
  }
});

test("safeNextPath refuses paths the URL parser normalises to //host", () => {
  for (const value of ["/.//evil.com", "/%2e//evil.com", "/a/..//evil.com", "/./\\evil.com"]) {
    const result = safeNextPath(value, FALLBACK);
    assert.ok(!result.startsWith("//"), `${value} gave ${result}`);
    assert.equal(result, FALLBACK, value);
  }
});

test("parseFunnelId accepts slugs and falls back to direct-sale", () => {
  assert.equal(parseFunnelId("start"), "start");
  assert.equal(parseFunnelId("direct-sale"), "direct-sale");
  assert.equal(parseFunnelId("Bad Id"), "direct-sale");
  assert.equal(parseFunnelId("<script>"), "direct-sale");
  assert.equal(parseFunnelId(null), "direct-sale");
});
