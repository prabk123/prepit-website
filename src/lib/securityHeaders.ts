/**
 * Security headers sent on every page and file the website serves (PRE-379).
 *
 * The main one is framing: `/withdraw` ends a subscription and refunds it in
 * two clicks, so no site, ours included, may show our pages in a frame
 * (`frame-ancestors 'none'`, plus `X-Frame-Options: DENY` for older
 * browsers). Firebase's sign-in handler is the one exception: Firebase loads
 * `/__/auth/iframe` from the auth domain in a hidden frame, and in production
 * that domain is this site (PRE-374), so `/__/auth/*` allows same-origin
 * framing. That rule must come after the every-path rule: when two rules set
 * the same header, Next.js sends the later one.
 *
 * PostHog's heatmaps and toolbar show our pages inside a frame on PostHog's
 * own site, so that origin (`NEXT_PUBLIC_POSTHOG_UI_HOST`, set on Production)
 * is allowed to frame us too. Browsers that support `frame-ancestors` ignore
 * `X-Frame-Options` when both are sent, so `DENY` only applies in old
 * browsers that can't honour the allowlist.
 *
 * Only `frame-ancestors` is set in the CSP. It does not limit which scripts,
 * images or frames our pages load, so RevenueCat and Stripe checkout frames,
 * Google and Apple sign-in popups, PostHog and the Meta Pixel are unaffected.
 *
 * HSTS leaves out `includeSubDomains` and `preload`: other tryprepit.app
 * subdomains (the API, analytics proxy, email link tracking) are not run from
 * here, and preloading can't be undone quickly.
 *
 * Kept free of Next imports: next.config.ts and the unit tests import it.
 */

type Header = { key: string; value: string };
type HeaderRule = { source: string; headers: Header[] };

/** `https://host[:port]` for an https URL, or null for anything else. */
export function httpsOrigin(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" ? parsed.origin : null;
  } catch {
    return null;
  }
}

function frameAncestors(sources: string[]): string {
  return `frame-ancestors ${sources.length ? sources.join(" ") : "'none'"}`;
}

/**
 * Next.js `headers()` entries, in order: every path, then the sign-in handler
 * paths (`FIREBASE_AUTH_HANDLER_SOURCES`) that override its framing headers.
 * `posthogUiHost` is the PostHog app URL allowed to frame pages for heatmaps.
 */
export function securityHeaderRules(
  authHandlerSources: readonly string[],
  posthogUiHost?: string | null,
): HeaderRule[] {
  const posthog = httpsOrigin(posthogUiHost);
  const pageAncestors = posthog ? [posthog] : [];
  return [
    {
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: frameAncestors(pageAncestors) },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=63072000" },
      ],
    },
    ...authHandlerSources.map((source) => ({
      source,
      headers: [
        { key: "Content-Security-Policy", value: frameAncestors(["'self'", ...pageAncestors]) },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    })),
  ];
}
