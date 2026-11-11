// Unit tests for the checkout sheet's colours (PRE-467). Run with `yarn test`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CHECKOUT_APPEARANCE } from "../src/lib/revenuecat/checkoutAppearance.ts";

const tokens = readFileSync(new URL("../src/app/tokens.css", import.meta.url), "utf8");
/** A light-theme token's value from tokens.css (its first definition). */
const token = (name) => tokens.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim().toLowerCase();

test("uses the website's colours, not RevenueCat's blue", () => {
  assert.equal(CHECKOUT_APPEARANCE.color_page_bg, token("color-paywall-web"));
  assert.equal(CHECKOUT_APPEARANCE.color_product_info_bg, token("color-paywall-web"));
  assert.equal(CHECKOUT_APPEARANCE.color_form_bg, token("color-paywall"));
  assert.equal(CHECKOUT_APPEARANCE.color_accent, token("color-accent"));
  assert.equal(CHECKOUT_APPEARANCE.color_error, token("color-error"));
  for (const value of Object.values(CHECKOUT_APPEARANCE).filter((v) => typeof v === "string" && v.startsWith("#"))) {
    assert.notEqual(value.toLowerCase(), "#576cdb", "RevenueCat's default button blue");
    assert.notEqual(value.toLowerCase(), "#eff3fa", "RevenueCat's default pale blue");
  }
});

test("the button is black with white text, and corners are not pills", () => {
  assert.equal(CHECKOUT_APPEARANCE.color_buttons_primary, "#000000");
  assert.equal(CHECKOUT_APPEARANCE.color_buttons_primary_text, "#ffffff");
  assert.equal(CHECKOUT_APPEARANCE.shapes, "rounded");
});

test("only sets colours and corners, never the product description switch", () => {
  assert.equal("show_product_description" in CHECKOUT_APPEARANCE, false);
  assert.equal("font" in CHECKOUT_APPEARANCE, false);
});
