// Unit tests for the website's remote image allowlist (PRE-380). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { canOptimiseImage, optimisedImageRemotePatterns } from "../src/lib/images/remoteImages.ts";

test("remote patterns name exact HTTPS hosts and no wildcard", () => {
  const patterns = optimisedImageRemotePatterns();
  assert.deepEqual(
    patterns.map((p) => p.hostname),
    ["images.m1a.dev", "api.tryprepit.app", "api.m1a.dev"],
  );
  for (const p of patterns) {
    assert.equal(p.protocol, "https");
    assert.ok(!p.hostname.includes("*"));
  }
});

test("recipe images on the CDN and the API are optimised", () => {
  assert.equal(canOptimiseImage("https://images.m1a.dev/recipes/abc.jpg"), true);
  assert.equal(canOptimiseImage("https://api.tryprepit.app/dev/seed-photos/oats.jpg"), true);
  assert.equal(canOptimiseImage("https://api.m1a.dev/x.png"), true);
  assert.equal(canOptimiseImage("/logo.png"), true);
});

test("any other host, including S3, is left to the browser", () => {
  assert.equal(canOptimiseImage("https://prepit-images.s3.amazonaws.com/a.jpg"), false);
  assert.equal(canOptimiseImage("https://attacker.s3.eu-west-2.amazonaws.com/a.jpg"), false);
  assert.equal(canOptimiseImage("https://images.m1a.dev.evil.com/a.jpg"), false);
  assert.equal(canOptimiseImage("http://images.m1a.dev/a.jpg"), false);
  assert.equal(canOptimiseImage("//evil.com/a.jpg"), false);
  assert.equal(canOptimiseImage("not a url"), false);
});
