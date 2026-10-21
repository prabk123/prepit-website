// Unit tests for the legal pages' "Contents" list (PRE-290). Run with `yarn test`.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { legalHeadingId, legalHeadings } from "../src/lib/legalHeadings.ts";

test("ids are lower-case words joined by hyphens", () => {
  assert.equal(legalHeadingId("5. Subscriptions and payment"), "5-subscriptions-and-payment");
  assert.equal(legalHeadingId("How we use it & our legal basis"), "how-we-use-it-and-our-legal-basis");
  assert.equal(legalHeadingId("Our website's quiz"), "our-website-s-quiz");
});

test("only ## headings outside code fences are listed", () => {
  const source = "## One\n\n### Not this\n\n```mdx\n## Not this either\n```\n\n## Two\n";
  assert.deepEqual(legalHeadings(source), [
    { id: "one", text: "One" },
    { id: "two", text: "Two" },
  ]);
});

test("every legal page's headings have unique, non-empty ids", () => {
  const dir = new URL("../src/content/legal/", import.meta.url);
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".mdx"))) {
    const headings = legalHeadings(readFileSync(new URL(file, dir), "utf8"));
    assert.ok(headings.length > 2, `${file} has a contents list`);
    const ids = headings.map((heading) => heading.id);
    assert.ok(ids.every(Boolean), `${file}: empty id`);
    assert.equal(new Set(ids).size, ids.length, `${file}: duplicate id`);
  }
});
