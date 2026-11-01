import { test } from "node:test";
import assert from "node:assert/strict";
import { consentText, directPostBody, MEDIA_PREFIX, postRequestError } from "../src/lib/tiktok/publisher.ts";

const ok = {
  videoUrl: MEDIA_PREFIX + "prepit-reel-17.mp4",
  title: "Caption",
  privacy: "PUBLIC_TO_EVERYONE",
  disableComment: false,
  disableDuet: true,
  disableStitch: true,
  brandOrganic: true,
  brandedContent: false,
};
const opts = ["PUBLIC_TO_EVERYONE", "SELF_ONLY"];

test("accepts a reel from the media path with an offered privacy level", () => {
  assert.equal(postRequestError(ok, opts), null);
});

test("refuses videos from anywhere else", () => {
  assert.match(postRequestError({ ...ok, videoUrl: "https://example.com/x.mp4" }, opts), /reels/);
  assert.match(postRequestError({ ...ok, videoUrl: MEDIA_PREFIX + "../x.mp4" }, opts), /reels/);
});

test("needs a privacy level the creator offers, with no default", () => {
  assert.match(postRequestError({ ...ok, privacy: "" }, opts), /view/);
  assert.match(postRequestError({ ...ok, privacy: "FOLLOWER_OF_CREATOR" }, opts), /view/);
});

test("branded content can't be private", () => {
  assert.match(postRequestError({ ...ok, brandedContent: true, privacy: "SELF_ONLY" }, opts), /private/);
});

test("builds a PULL_FROM_URL direct post", () => {
  const b = directPostBody(ok);
  assert.equal(b.source_info.source, "PULL_FROM_URL");
  assert.equal(b.post_info.brand_organic_toggle, true);
  assert.equal(b.post_info.privacy_level, "PUBLIC_TO_EVERYONE");
});

test("consent line names the Branded Content Policy only for branded content", () => {
  assert.match(consentText(true), /Branded Content Policy/);
  assert.doesNotMatch(consentText(false), /Branded/);
});

test("only the allowed TikTok account may use the publisher", async () => {
  const { allowedCreator } = await import("../src/lib/tiktok/publisher.ts");
  assert.equal(allowedCreator("tryprepit"), true);
  assert.equal(allowedCreator("TryPrepIt"), true);
  assert.equal(allowedCreator("someoneelse"), false);
  assert.equal(allowedCreator(undefined), false);
  assert.equal(allowedCreator("b", "@a, b"), true);
});
