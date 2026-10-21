import { NextRequest, NextResponse } from "next/server";
import { CONTACT_HONEYPOT_FIELD, CONTACT_LIMITS, escapeSlackText } from "@/lib/contact";
import { COUNTRY_HEADER, parseCountryCode } from "@/lib/markets";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The waitlist for countries PrepIt doesn't sell in yet (PRE-331). Posts the
 * email and the country (from the proxy's geo header, never a form value) to
 * the same Slack channel as the contact form. Nothing is logged but failures,
 * and those without the email.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Only bots fill the hidden field: answer as if saved, post nothing.
  if (body[CONTACT_HONEYPOT_FIELD]) {
    return NextResponse.json({ success: true });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) {
    console.error("Waitlist: SLACK_WEBHOOK_URL is not configured");
    return NextResponse.json({ error: "Waitlist not configured" }, { status: 500 });
  }

  const country = parseCountryCode(request.headers.get(COUNTRY_HEADER)) ?? "unknown";
  const response = await fetch(slackWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blocks: [
        { type: "header", text: { type: "plain_text", text: "🌍 New waitlist sign-up", emoji: true } },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Email:*\n${escapeSlackText(email)}` },
            { type: "mrkdwn", text: `*Country:*\n${country}` },
          ],
        },
      ],
    }),
  }).catch(() => null);

  if (!response?.ok) {
    console.error("Waitlist: Slack post failed", response?.status ?? "network error");
    return NextResponse.json({ error: "Failed to join the waitlist" }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
