// Unit tests for the US "Do Not Sell or Share" rule (PRE-539). Run with `yarn test`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { GPC_COUNTRY, sharingOptOutReason } from "../src/lib/privacySharing.ts";

test("nothing set: sharing stays on", () => {
  assert.equal(sharingOptOutReason({ optOutCookie: undefined, globalPrivacyControl: undefined, country: "US" }), null);
});

test("the opt-out cookie turns sharing off anywhere", () => {
  for (const country of ["US", "CA", "GB", null]) {
    assert.equal(sharingOptOutReason({ optOutCookie: "1", globalPrivacyControl: false, country }), "choice");
  }
});

test("Global Privacy Control turns sharing off for US visitors", () => {
  assert.equal(sharingOptOutReason({ optOutCookie: undefined, globalPrivacyControl: true, country: "US" }), "gpc");
});

test("Global Privacy Control leaves other countries' defaults alone", () => {
  for (const country of ["CA", "AU", "NZ", "GB", "DE", null, undefined]) {
    assert.equal(sharingOptOutReason({ optOutCookie: undefined, globalPrivacyControl: true, country }), null);
  }
});

test("only a real true counts as the GPC signal, and only '1' as the cookie", () => {
  assert.equal(sharingOptOutReason({ optOutCookie: "0", globalPrivacyControl: "true", country: "US" }), null);
  assert.equal(sharingOptOutReason({ optOutCookie: "", globalPrivacyControl: 1, country: "US" }), null);
});

test("the Meta Pixel snippet checks the same cookie, GPC and country before loading", () => {
  const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  const loader = layout.slice(layout.indexOf("window.prepitLoadMetaPixel = function"), layout.indexOf("!function(f,b,e,v,n,t,s)"));
  assert.match(loader, /PREPIT_PRIVACY_OPT_OUT_COOKIE/);
  assert.match(loader, /navigator\.globalPrivacyControl === true/);
  assert.match(loader, /COUNTRY_COOKIE/);
  assert.match(loader, /GPC_COUNTRY/);
  assert.equal(GPC_COUNTRY, "US");
});

test("attribution and RevenueCat's Meta matching check the opt-out", () => {
  const store = readFileSync(new URL("../src/lib/funnel/attributionStore.ts", import.meta.url), "utf8");
  assert.match(store, /if \(isOptedOutOfSharing\(\)\) return false;/);
  const billing = readFileSync(new URL("../src/lib/revenuecat/webBilling.ts", import.meta.url), "utf8");
  assert.match(billing, /if \(!mayKeepAttribution\(\)\) return null;/);
});
