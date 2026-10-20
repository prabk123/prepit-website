/**
 * Query parameters the Web2App pages pass along: the funnel a visitor came
 * through, the plan they picked, and where to go after signing in.
 */

/** The direct-sale landing page's funnel (PRE-302); the default when none is given. */
export const DEFAULT_FUNNEL_ID = "direct-sale";

/** A funnel id is a short lowercase slug, e.g. "start" or "direct-sale". */
export function parseFunnelId(value: string | null | undefined): string {
  return value && /^[a-z0-9][a-z0-9-]{0,39}$/.test(value) ? value : DEFAULT_FUNNEL_ID;
}

/**
 * A same-site path to continue to after signing in. Anything else (another
 * site, `//host`, a backslash trick) falls back to `fallback`.
 */
export function safeNextPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://www.tryprepit.app");
    if (url.origin !== "https://www.tryprepit.app") return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
