// Unit tests for the hosts that get PostHog's tracing headers (PRE-521). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { tracingHeaderHosts } from "../src/lib/tracingHeaders.ts";

test("tracingHeaderHosts takes the hostnames of the API and connector URLs", () => {
  assert.deepEqual(
    tracingHeaderHosts(["https://api.tryprepit.app", "https://mcp.tryprepit.app/oauth"]),
    ["api.tryprepit.app", "mcp.tryprepit.app"],
  );
});

test("tracingHeaderHosts drops duplicates, blanks and non-URLs", () => {
  assert.deepEqual(
    tracingHeaderHosts(["https://API.m1a.dev/", undefined, null, "  ", "not a url", "https://api.m1a.dev/oauth"]),
    ["api.m1a.dev"],
  );
});

test("tracingHeaderHosts allows http only on localhost", () => {
  assert.deepEqual(tracingHeaderHosts(["http://localhost:8081", "http://127.0.0.1:8082/oauth"]), ["localhost", "127.0.0.1"]);
  assert.deepEqual(tracingHeaderHosts(["http://api.tryprepit.app", "ftp://api.tryprepit.app"]), []);
});
