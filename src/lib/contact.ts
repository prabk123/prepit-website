/**
 * Contact form limits, shared by the form and /api/contact. Slack caps a
 * section block's text at 3,000 characters, so the message stays under it
 * with room for the label.
 */
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 2500,
} as const;

/**
 * A hidden field people never see or fill. Bots that fill every input do,
 * and the route then drops the submission while still answering 200.
 */
export const CONTACT_HONEYPOT_FIELD = "website";

/** A Slack Block Kit block, loosely typed: these messages only go to a webhook. */
type SlackBlock = Record<string, unknown>;

/**
 * Visitor text goes to Slack as `plain_text`, which Slack never parses: no
 * @channel or @here pings, no links, no formatting (PRE-382). Only our own
 * labels and the timestamp use mrkdwn.
 */
function visitorText(label: string, value: string) {
  return { type: "plain_text", text: `${label}:\n${value}`, emoji: false };
}

function header(text: string): SlackBlock {
  return { type: "header", text: { type: "plain_text", text, emoji: true } };
}

/** The Slack message for a contact or feedback form submission. */
export function contactSlackMessage(
  { name, email, message, isFeedback }: { name: string; email: string; message: string; isFeedback: boolean },
  now = new Date()
): { blocks: SlackBlock[] } {
  return {
    blocks: [
      header(isFeedback ? "💬 New Feedback Submission" : "🍃 New Contact Form Submission"),
      { type: "section", fields: [visitorText("Name", name), visitorText("Email", email)] },
      { type: "section", text: visitorText("Message", message) },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Submitted at: <!date^${Math.floor(now.getTime() / 1000)}^{date_short_pretty} at {time}|${now.toISOString()}>`,
          },
        ],
      },
    ],
  };
}

/** The Slack message for a waitlist sign-up. `country` is a two-letter code or "unknown". */
export function waitlistSlackMessage({ email, country }: { email: string; country: string }): { blocks: SlackBlock[] } {
  return {
    blocks: [
      header("🌍 New waitlist sign-up"),
      { type: "section", fields: [visitorText("Email", email), visitorText("Country", country)] },
    ],
  };
}
