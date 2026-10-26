// Unit tests for showing RevenueCat's paywall in its light colours (PRE-375). Run with `yarn test`.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { forceLightPaywall, isDarkSchemeQuery, systemPrefersDark } from "../src/lib/revenuecat/lightPaywall.ts";

/** A browser in dark mode: every dark colour-scheme query matches. */
function darkModeWindow() {
  const matchMedia = (query) => ({ matches: /dark/.test(query), media: query });
  globalThis.window = { matchMedia };
  return matchMedia;
}

afterEach(() => {
  delete globalThis.window;
});

test("recognises the dark colour-scheme query however it is written", () => {
  for (const query of ["(prefers-color-scheme: dark)", "prefers-color-scheme: dark", "(prefers-color-scheme:dark)", "screen and (PREFERS-COLOR-SCHEME: DARK)"]) {
    assert.equal(isDarkSchemeQuery(query), true, query);
  }
  for (const query of ["(prefers-color-scheme: light)", "(max-width: 767px)", "(prefers-reduced-motion: reduce)"]) {
    assert.equal(isDarkSchemeQuery(query), false, query);
  }
});

test("while held, a dark-mode browser reads as light; other queries are untouched", () => {
  const real = darkModeWindow();
  const release = forceLightPaywall();
  assert.equal(window.matchMedia("(prefers-color-scheme: dark)").matches, false);
  assert.equal(window.matchMedia("(max-width: 767px)").matches, false);
  assert.equal(window.matchMedia("(something-dark)").matches, true);
  assert.equal(systemPrefersDark(), true, "analytics still sees the real setting");
  release();
  assert.equal(window.matchMedia, real);
  assert.equal(window.matchMedia("(prefers-color-scheme: dark)").matches, true);
});

test("nested holds restore the browser only when the last one is released", () => {
  const real = darkModeWindow();
  const first = forceLightPaywall();
  const second = forceLightPaywall();
  first();
  first();
  assert.equal(window.matchMedia("(prefers-color-scheme: dark)").matches, false);
  second();
  assert.equal(window.matchMedia, real);
});

test("does nothing without a window", () => {
  const release = forceLightPaywall();
  release();
  assert.equal(systemPrefersDark(), false);
});
