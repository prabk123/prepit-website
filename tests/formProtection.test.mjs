// Unit tests for the form rate limit (PRE-381) and plain-text Slack messages (PRE-382). Run with `yarn test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { contactSlackMessage, waitlistSlackMessage } from "../src/lib/contact.ts";
import { createRateLimiter, FORM_RATE_LIMIT, rateLimitKey } from "../src/lib/rateLimit.ts";

test("the form limit lets five posts through in ten minutes, then refuses", () => {
  const limit = createRateLimiter(FORM_RATE_LIMIT);
  const start = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(limit("1.2.3.4", start + i * 1000).allowed, true, `post ${i + 1}`);
  const refused = limit("1.2.3.4", start + 5000);
  assert.equal(refused.allowed, false);
  // The oldest post leaves the window at start + 10 minutes.
  assert.equal(refused.retryAfterSeconds, 595);
});

test("each visitor has their own count", () => {
  const limit = createRateLimiter({ limit: 1, windowMs: 60_000 });
  assert.equal(limit("a", 0).allowed, true);
  assert.equal(limit("a", 1).allowed, false);
  assert.equal(limit("b", 1).allowed, true);
});

test("posts are allowed again once the window slides past them", () => {
  const limit = createRateLimiter({ limit: 2, windowMs: 60_000 });
  assert.equal(limit("a", 0).allowed, true);
  assert.equal(limit("a", 30_000).allowed, true);
  assert.equal(limit("a", 59_999).allowed, false);
  assert.equal(limit("a", 60_000).allowed, true);
  assert.equal(limit("a", 60_001).allowed, false);
});

test("refused posts don't extend the wait", () => {
  const limit = createRateLimiter({ limit: 1, windowMs: 60_000 });
  limit("a", 0);
  for (let t = 1000; t < 60_000; t += 1000) limit("a", t);
  assert.equal(limit("a", 60_000).allowed, true);
});

test("the limiter forgets the least recently seen visitors past maxKeys", () => {
  const limit = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });
  limit("a", 0);
  limit("b", 1);
  limit("c", 2); // drops "a"
  assert.equal(limit("a", 3).allowed, true);
  assert.equal(limit("c", 4).allowed, false);
});

test("a refunded post doesn't count, so failures on our side don't lock a visitor out", () => {
  const limit = createRateLimiter({ limit: 2, windowMs: 60_000 });
  for (let t = 0; t < 10; t++) {
    const result = limit("a", t);
    assert.equal(result.allowed, true, `attempt ${t + 1}`);
    result.refund();
  }
  assert.equal(limit("a", 11).allowed, true);
  assert.equal(limit("a", 12).allowed, true);
  assert.equal(limit("a", 13).allowed, false);
});

test("a refused visitor stays recently seen, so a flood of new addresses doesn't reset them", () => {
  const limit = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2 });
  limit("abuser", 0);
  limit("b", 1);
  assert.equal(limit("abuser", 2).allowed, false);
  limit("c", 3); // drops "b", the least recently seen
  assert.equal(limit("abuser", 4).allowed, false);
  assert.equal(limit("b", 5).allowed, true);
});

test("rate-limit keys: IPv4 as is, IPv6 by its /64, nothing without an address", () => {
  assert.equal(rateLimitKey("203.0.113.7"), "203.0.113.7");
  assert.equal(rateLimitKey("2001:db8:abcd:12:1:2:3:4"), "2001:db8:abcd:12::/64");
  assert.equal(rateLimitKey("2001:0DB8:abcd:0012:ffff::1"), "2001:db8:abcd:12::/64");
  assert.equal(rateLimitKey("2001:db8::1"), "2001:db8:0:0::/64");
  assert.equal(rateLimitKey("::1"), "0:0:0:0::/64");
  assert.equal(rateLimitKey(undefined), null);
  assert.equal(rateLimitKey(""), null);
});

function textObjects(message) {
  return message.blocks.flatMap((block) => [...(block.fields ?? []), ...(block.text && block.type === "section" ? [block.text] : [])]);
}

test("contact form text reaches Slack as plain text, unchanged", () => {
  const nasty = "<!channel> @here *bold* <https://evil.example|click> & more";
  const message = contactSlackMessage(
    { name: nasty, email: "a@b.co", message: nasty, isFeedback: false },
    new Date("2026-10-27T12:00:00Z")
  );
  const visitorFields = textObjects(message);
  assert.equal(visitorFields.length, 3);
  for (const field of visitorFields) {
    assert.equal(field.type, "plain_text");
    assert.equal(field.emoji, false);
  }
  assert.equal(visitorFields[0].text, `Name:\n${nasty}`);
  assert.equal(visitorFields[1].text, "Email:\na@b.co");
  assert.equal(visitorFields[2].text, `Message:\n${nasty}`);
  assert.equal(message.blocks[0].text.text, "🍃 New Contact Form Submission");
  assert.match(message.blocks[3].elements[0].text, /^Submitted at: <!date\^1793102400\^/);
});

test("feedback keeps its own header", () => {
  const message = contactSlackMessage({ name: "n", email: "a@b.co", message: "m", isFeedback: true });
  assert.equal(message.blocks[0].text.text, "💬 New Feedback Submission");
});

test("waitlist email and country reach Slack as plain text", () => {
  const message = waitlistSlackMessage({ email: "<!everyone>@x.co", country: "GB" });
  assert.deepEqual(textObjects(message), [
    { type: "plain_text", text: "Email:\n<!everyone>@x.co", emoji: false },
    { type: "plain_text", text: "Country:\nGB", emoji: false },
  ]);
});
