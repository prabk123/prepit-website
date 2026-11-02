import { test } from "node:test";
import assert from "node:assert/strict";
import { containerParams, duePosts, MAX_LATE_MS, VIDEO_PREFIX } from "../src/lib/instagram/publisher.ts";

const now = Date.parse("2026-11-02T17:05:00Z");
const item = (over = {}) => ({
  slot_id: "2026-11-02 Main",
  reel: "15",
  at: "2026-11-02T17:00:00Z",
  video_url: VIDEO_PREFIX + "ig-15-abc.mp4",
  caption: "Veggies first works.\nPrepIt is free to try, link in bio.",
  ...over,
});

test("posts a queued reel once its slot opens", () => {
  assert.deepEqual(duePosts([item()], [], now).map((q) => q.reel), ["15"]);
});

test("waits for future slots and skips ones missed by too long", () => {
  assert.equal(duePosts([item({ at: "2026-11-02T23:00:00Z" })], [], now).length, 0);
  const stale = new Date(now - MAX_LATE_MS - 1000).toISOString();
  assert.equal(duePosts([item({ at: stale })], [], now).length, 0);
});

test("skips a reel already on the account (same caption, whitespace aside)", () => {
  const recent = [{ id: "1", caption: "Veggies first works. PrepIt is free to try, link in bio." }];
  assert.equal(duePosts([item()], recent, now).length, 0);
});

test("refuses videos from outside the reels store and malformed items", () => {
  assert.equal(duePosts([item({ video_url: "https://example.com/x.mp4" })], [], now).length, 0);
  assert.equal(duePosts([item({ video_url: VIDEO_PREFIX + "../x.mp4" })], [], now).length, 0);
  assert.equal(duePosts([item({ caption: " " })], [], now).length, 0);
  assert.equal(duePosts({ not: "a list" }, [], now).length, 0);
});

test("oldest slot first, each reel at most once", () => {
  const q = [item({ slot_id: "b", at: "2026-11-02T16:00:00Z", reel: "18" }), item({ slot_id: "a", at: "2026-11-02T13:00:00Z", reel: "18", caption: "x" }), item()];
  assert.deepEqual(duePosts(q, [], now).map((x) => x.slot_id), ["a", "2026-11-02 Main"]);
});

test("trial reels add trial params", () => {
  assert.equal(containerParams(item(), false).trial_params, undefined);
  assert.match(containerParams(item(), true).trial_params, /MANUAL/);
  assert.equal(containerParams(item(), true).share_to_feed, "true");
});
