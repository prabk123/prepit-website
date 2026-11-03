import { test } from "node:test";
import assert from "node:assert/strict";
import { dueDrafts, inboxInitBody, SEND_WINDOW_MS, VIDEO_PREFIX } from "../src/lib/tiktok/inbox.ts";

const item = (over = {}) => ({
  slot_id: "2026-11-04 Backfill",
  reel: "18",
  at: "2026-11-04T10:00:00Z",
  video_url: VIDEO_PREFIX + "ig-prepit-reel-18-v4.mp4",
  ...over,
});
const at = Date.parse("2026-11-04T10:00:00Z");

test("sends a draft in the hour its slot opens", () => {
  assert.deepEqual(dueDrafts([item()], at + 40 * 60 * 1000).map((q) => q.reel), ["18"]);
});

test("does not send before the slot or after its hour, so a draft goes out once", () => {
  assert.equal(dueDrafts([item()], at - 1).length, 0);
  assert.equal(dueDrafts([item()], at + SEND_WINDOW_MS).length, 0);
});

test("ignores videos from outside the reels store and bad entries", () => {
  const bad = [item({ video_url: "https://example.com/x.mp4" }), item({ video_url: VIDEO_PREFIX + "../x" }), item({ at: "soon" }), null, "x"];
  assert.equal(dueDrafts(bad, at + 1000).length, 0);
  assert.equal(dueDrafts({ not: "a list" }, at + 1000).length, 0);
});

test("sends each reel once, oldest slot first", () => {
  const q = [item({ reel: "19", slot_id: "b", at: "2026-11-04T10:30:00Z" }), item(), item({ slot_id: "c" })];
  assert.deepEqual(dueDrafts(q, at + 45 * 60 * 1000).map((x) => x.reel), ["18", "19"]);
});

test("init body is a single-chunk file upload", () => {
  assert.deepEqual(inboxInitBody(1234), {
    source_info: { source: "FILE_UPLOAD", video_size: 1234, chunk_size: 1234, total_chunk_count: 1 },
  });
});
