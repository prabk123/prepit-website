// Unit tests for which page changes send Meta a PageView (PRE-568). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { isNewMetaPage, metaPixelBlockedPage } from "../src/lib/metaPixelRoutes.ts";

test("the first page is left to the pixel snippet's own PageView", () => {
  assert.equal(isNewMetaPage(null, "/quiz"), false);
});

test("each later page is new, the same page again is not", () => {
  assert.equal(isNewMetaPage("/quiz", "/start"), true);
  assert.equal(isNewMetaPage("/start", "/welcome"), true);
  assert.equal(isNewMetaPage("/start", "/start"), false);
});

test("pages with a token in the address never reach Meta, as in the snippet", () => {
  assert.equal(metaPixelBlockedPage("/my-plan", ""), true);
  assert.equal(metaPixelBlockedPage("/my-plan/abc", ""), true);
  assert.equal(metaPixelBlockedPage("/email-preferences", "?token=x"), true);
  assert.equal(metaPixelBlockedPage("/email-preferences/x", ""), true);
  assert.equal(metaPixelBlockedPage("/account", "?token=abc"), true);
  assert.equal(metaPixelBlockedPage("/account/", "?a=1&token=abc"), true);
});

test("the funnel pages and a plain /account visit do", () => {
  for (const path of ["/", "/quiz", "/start", "/checkout", "/welcome", "/my-planner"]) {
    assert.equal(metaPixelBlockedPage(path, "?funnel=quiz"), false, path);
  }
  assert.equal(metaPixelBlockedPage("/account", ""), false);
});
