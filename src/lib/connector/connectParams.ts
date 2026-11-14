/**
 * Pure helpers for the connector's consent page (PRE-507). Kept free of
 * Next and Firebase imports so the unit tests can import them.
 *
 * The OAuth server (fresca_backend PRE-504) sends the browser to
 * `/connect?interaction=<uid>`. The page then talks to that server's
 * interaction endpoints on the connector host, never the main API.
 */

/** The connector's OAuth issuer when `NEXT_PUBLIC_MCP_OAUTH_ISSUER` isn't set. */
export const DEFAULT_MCP_OAUTH_ISSUER = "https://mcp.tryprepit.app/oauth";

/** The same pattern the OAuth server accepts for an interaction id. */
const INTERACTION_UID_PATTERN = /^[A-Za-z0-9_-]{10,64}$/;

/** The interaction id from the page's query, or null when it is missing or malformed. */
export function parseInteractionUid(value: string | null | undefined): string | null {
  const uid = value?.trim() ?? "";
  return INTERACTION_UID_PATTERN.test(uid) ? uid : null;
}

/**
 * The issuer the page calls, without a trailing slash. Only https (or
 * http on localhost, for local development) with a path; anything else
 * falls back to the default.
 */
export function resolveMcpIssuer(raw: string | null | undefined): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_MCP_OAUTH_ISSUER;
  try {
    const url = new URL(value);
    const local = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if ((url.protocol !== "https:" && !local) || url.username || url.password || url.search || url.hash) {
      return DEFAULT_MCP_OAUTH_ISSUER;
    }
    const path = url.pathname.replace(/\/+$/, "");
    if (!path) return DEFAULT_MCP_OAUTH_ISSUER;
    return `${url.origin}${path}`;
  } catch {
    return DEFAULT_MCP_OAUTH_ISSUER;
  }
}

/** `<issuer>/interaction/<uid>/<action>`. */
export function interactionUrl(issuer: string, uid: string, action: "details" | "approve" | "deny"): string {
  return `${issuer}/interaction/${encodeURIComponent(uid)}/${action}`;
}

/**
 * Where to send the browser after Allow or Cancel. The server builds it, but
 * the page only follows an https URL (or http on localhost), never a
 * `javascript:` or other scheme.
 */
export function safeRedirect(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return url.toString();
    if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/** Why the server says this account can't connect (fresca_backend `McpAccessBlockedReason`). */
export type ConnectBlockedReason = "disabled" | "flag_off" | "no_account" | "deleted" | "no_subscription" | "unknown";

export function toBlockedReason(value: unknown): ConnectBlockedReason {
  return value === "disabled" ||
    value === "flag_off" ||
    value === "no_account" ||
    value === "deleted" ||
    value === "no_subscription"
    ? value
    : "unknown";
}

/** Which AI app is asking, for analytics only: claude, chatgpt or other. Never the raw name or host. */
export function clientKindFromHost(host: string | null | undefined): "claude" | "chatgpt" | "other" {
  const h = (host ?? "").toLowerCase();
  if (h === "claude.ai" || h === "claude.com" || h.endsWith(".claude.ai") || h.endsWith(".claude.com")) return "claude";
  if (h === "chatgpt.com" || h === "openai.com" || h.endsWith(".openai.com")) return "chatgpt";
  return "other";
}

/**
 * The name to show for the AI app. It comes from the app's own registration,
 * so it is untrusted: trimmed, one line, at most 60 characters, and always
 * rendered as text.
 */
export function displayClientName(name: unknown): string {
  if (typeof name !== "string") return "An AI app";
  const clean = name.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return "An AI app";
  return clean.length > 60 ? `${clean.slice(0, 59)}…` : clean;
}

/** What the AI app can read once allowed, in the order the consent page lists it. */
export const CONNECTOR_READS: readonly string[] = [
  "Your food log, with calories and nutrients",
  "Your calorie and nutrient targets and goals",
  "Your meal plans",
  "Your weight history",
  "Calories burned and workouts from Apple Health",
  "Your weekly check-ins",
  "Your daily Energy, Satiety and Mood scores",
  "Your supplements",
];
