// Unit tests for the connector consent page helpers (PRE-507). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clientKindFromHost,
  DEFAULT_MCP_OAUTH_ISSUER,
  displayClientName,
  interactionUrl,
  parseInteractionUid,
  resolveMcpIssuer,
  safeRedirect,
  toBlockedReason,
} from "../src/lib/connector/connectParams.ts";

test("parseInteractionUid takes only ids the OAuth server would accept", () => {
  assert.equal(parseInteractionUid("abcDEF123_-xyz"), "abcDEF123_-xyz");
  assert.equal(parseInteractionUid("  abcDEF123_-xyz "), "abcDEF123_-xyz");
  for (const bad of [null, undefined, "", "short", "a".repeat(65), "abc/../details1", "abc%2Fdef12345", "<script>12345"]) {
    assert.equal(parseInteractionUid(bad), null, String(bad));
  }
});

test("resolveMcpIssuer keeps an https issuer with a path and falls back otherwise", () => {
  assert.equal(resolveMcpIssuer(undefined), DEFAULT_MCP_OAUTH_ISSUER);
  assert.equal(resolveMcpIssuer("https://mcp-dev.example.app/oauth/"), "https://mcp-dev.example.app/oauth");
  assert.equal(resolveMcpIssuer("http://localhost:8081/oauth"), "http://localhost:8081/oauth");
  for (const bad of ["", "not a url", "http://mcp.example.app/oauth", "https://mcp.example.app", "https://u:p@mcp.example.app/oauth", "javascript:alert(1)", "https://mcp.example.app/oauth?x=1"]) {
    assert.equal(resolveMcpIssuer(bad), DEFAULT_MCP_OAUTH_ISSUER, bad);
  }
});

test("interactionUrl builds the three endpoints under the issuer", () => {
  assert.equal(interactionUrl("https://mcp.tryprepit.app/oauth", "abcDEF123_-xyz", "details"), "https://mcp.tryprepit.app/oauth/interaction/abcDEF123_-xyz/details");
  assert.equal(interactionUrl("https://mcp.tryprepit.app/oauth", "abcDEF123_-xyz", "approve"), "https://mcp.tryprepit.app/oauth/interaction/abcDEF123_-xyz/approve");
});

test("safeRedirect follows only https, or http on localhost", () => {
  assert.equal(safeRedirect("https://claude.ai/api/mcp/auth_callback?code=x"), "https://claude.ai/api/mcp/auth_callback?code=x");
  assert.equal(safeRedirect("http://localhost:3000/cb"), "http://localhost:3000/cb");
  for (const bad of [undefined, null, 42, "", "javascript:alert(1)", "data:text/html,hi", "http://evil.example/cb", "//claude.ai/x", "/relative"]) {
    assert.equal(safeRedirect(bad), null, String(bad));
  }
});

test("toBlockedReason keeps known reasons only", () => {
  assert.equal(toBlockedReason("flag_off"), "flag_off");
  assert.equal(toBlockedReason("no_subscription"), "no_subscription");
  assert.equal(toBlockedReason("something_new"), "unknown");
  assert.equal(toBlockedReason(undefined), "unknown");
});

test("clientKindFromHost reports only claude, chatgpt or other", () => {
  assert.equal(clientKindFromHost("claude.ai"), "claude");
  assert.equal(clientKindFromHost("www.claude.com"), "claude");
  assert.equal(clientKindFromHost("chatgpt.com"), "chatgpt");
  assert.equal(clientKindFromHost("notclaude.ai"), "other");
  assert.equal(clientKindFromHost(null), "other");
});

test("displayClientName cleans the app's own name", () => {
  assert.equal(displayClientName("Claude"), "Claude");
  assert.equal(displayClientName("  Claude\n\tDesktop  "), "Claude Desktop");
  assert.equal(displayClientName(""), "An AI app");
  assert.equal(displayClientName(undefined), "An AI app");
  const long = displayClientName("x".repeat(200));
  assert.equal(long.length, 60);
  assert.ok(long.endsWith("…"));
});
