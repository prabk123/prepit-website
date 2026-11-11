// Unit tests for the server-issued quiz session id (PRE-398). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { keepServerWebSessionId, serverWebSessionId } from "../src/lib/funnel/bridgeHandoff.ts";

const SIGNED = "ws1.6f1c2a8e-3b4d-4c5e-9f00-112233445566.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ";

test("serverWebSessionId takes only the backend's signed id", () => {
  assert.equal(serverWebSessionId({ saved: true, webSessionId: SIGNED }), SIGNED);
  // Backends from before PRE-398 send no id.
  assert.equal(serverWebSessionId({ saved: true }), undefined);
  assert.equal(serverWebSessionId({ webSessionId: "6f1c2a8e-3b4d-4c5e-9f00-112233445566" }), undefined);
  assert.equal(serverWebSessionId({ webSessionId: "ws1.<script>" }), undefined);
  assert.equal(serverWebSessionId({ webSessionId: 42 }), undefined);
  assert.equal(serverWebSessionId(null), undefined);
});

test("keepServerWebSessionId replaces the browser's id and survives blocked storage", () => {
  const store = new Map([["prepit.webSessionId", "browser-made-id-0001"]]);
  globalThis.window = {
    localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
  };
  try {
    keepServerWebSessionId({ saved: true });
    assert.equal(store.get("prepit.webSessionId"), "browser-made-id-0001");
    keepServerWebSessionId({ saved: true, webSessionId: SIGNED });
    assert.equal(store.get("prepit.webSessionId"), SIGNED);
    globalThis.window = {
      localStorage: {
        setItem: () => {
          throw new Error("blocked");
        },
      },
    };
    assert.doesNotThrow(() => keepServerWebSessionId({ webSessionId: SIGNED }));
  } finally {
    delete globalThis.window;
  }
});

test("a signed id longer than 128 characters still passes", () => {
  const long = `ws1.${"a".repeat(100)}.${"b".repeat(43)}`;
  assert.equal(serverWebSessionId({ webSessionId: long }), long);
  assert.equal(serverWebSessionId({ webSessionId: `ws1.${"a".repeat(100)}.short` }), undefined);
});
