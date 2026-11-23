// Unit tests for what session recordings show of typed fields (PRE-570). Run with `yarn test`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { REPLAY_UNMASKED_ATTRIBUTE, replayInputText } from "../src/lib/replayMasking.ts";

/** A field that is (or isn't) inside the quiz. */
function field(type, insideQuiz) {
  return {
    type,
    closest: (selector) => (insideQuiz && selector === `[${REPLAY_UNMASKED_ATTRIBUTE}]` ? {} : null),
  };
}

test("quiz fields are shown as typed", () => {
  assert.equal(replayInputText("172", field("number", true)), "172");
  assert.equal(replayInputText("Sam", field("text", true)), "Sam");
});

test("fields outside the quiz stay masked", () => {
  assert.equal(replayInputText("sam@example.com", field("email", false)), "*".repeat(15));
});

test("password fields stay masked, even in the quiz", () => {
  assert.equal(replayInputText("secret", field("password", true)), "******");
});

test("a missing or unusual element is masked", () => {
  assert.equal(replayInputText("abc", null), "***");
  assert.equal(replayInputText("abc", undefined), "***");
  assert.equal(replayInputText("abc", { type: "text" }), "***");
});

test("the quiz carries the unmasked marker and no longer blocks recordings", () => {
  const quiz = readFileSync(new URL("../src/app/quiz/Quiz.tsx", import.meta.url), "utf8");
  assert.match(quiz, new RegExp(`${REPLAY_UNMASKED_ATTRIBUTE}=""[^>]*className="quiz-v9 ph-sensitive `));
  assert.doesNotMatch(quiz, /ph-no-capture/);
});

test("the website never records request or response bodies", () => {
  const client = readFileSync(new URL("../src/lib/posthogClient.ts", import.meta.url), "utf8");
  assert.match(client, /recordBody: false/);
  assert.match(client, /maskAllInputs: true/);
});
