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

/** Slack's documented mrkdwn escaping, so text can't ping @channel or fake links. */
export function escapeSlackText(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
