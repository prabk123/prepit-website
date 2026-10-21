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
    // The parser normalises the path (`/.//evil.com` becomes `//evil.com`),
    // so check what comes out too: a leading `//` would leave the site.
    const path = `${url.pathname}${url.search}`;
    if (path.startsWith("//") || path.includes("\\")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}

/** Where the visitor came from; picks the bridge's header (PRE-323, contract in bridgeHandoff.ts). */
export type BridgeSource = "landing" | "quiz";

export function parseBridgeSource(value: string | null | undefined): BridgeSource {
  return value === "quiz" ? "quiz" : "landing";
}

/** The bridge URL (`/start`) for a source, plan and funnel. */
export function bridgePath({
  from,
  plan,
  funnel,
}: {
  from: BridgeSource;
  plan?: "annual" | "monthly" | null;
  funnel?: string | null;
}): string {
  const query = new URLSearchParams({ from });
  if (plan) query.set("plan", plan);
  query.set("funnel", parseFunnelId(funnel ?? DEFAULT_FUNNEL_ID));
  return `/start?${query}`;
}
