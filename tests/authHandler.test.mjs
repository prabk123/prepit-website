// Unit tests for serving Firebase's sign-in handler from the website (PRE-374). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  authDomainKind,
  firebaseAuthHandlerRewrites,
  firebaseHostingOrigin,
} from "../src/lib/firebase/authHandler.ts";

test("the handler is proxied to the project's firebaseapp.com host", () => {
  assert.deepEqual(firebaseAuthHandlerRewrites("fresca-dev"), [
    { source: "/__/auth/:path*", destination: "https://fresca-dev.firebaseapp.com/__/auth/:path*" },
    { source: "/__/firebase/init.json", destination: "https://fresca-dev.firebaseapp.com/__/firebase/init.json" },
  ]);
});

test("no project id falls back to the dev project the site already uses", () => {
  assert.equal(firebaseHostingOrigin(undefined), "https://fresca-dev.firebaseapp.com");
  assert.equal(firebaseHostingOrigin("  "), "https://fresca-dev.firebaseapp.com");
  assert.equal(firebaseHostingOrigin(" other-project "), "https://other-project.firebaseapp.com");
});

test("a project id that isn't a plain id never builds a proxy target", () => {
  for (const bad of ["evil.com/x", "a b", "x@y", "../x"]) {
    assert.throws(() => firebaseHostingOrigin(bad), /Invalid Firebase project id/, bad);
  }
});

test("analytics tells PrepIt's domain from Firebase's", () => {
  assert.equal(authDomainKind("www.tryprepit.app"), "prepit");
  assert.equal(authDomainKind(" WWW.tryprepit.app "), "prepit");
  assert.equal(authDomainKind("fresca-dev.firebaseapp.com"), "firebase");
  assert.equal(authDomainKind("fresca-dev.web.app"), "firebase");
  assert.equal(authDomainKind(undefined), "firebase");
  assert.equal(authDomainKind(""), "firebase");
});
