/**
 * Security headers sent on every page and file the website serves (PRE-379).
 *
 * The main one is framing: `/withdraw` ends a subscription and refunds it in
 * two clicks, so another site must not be able to show our pages in a frame
 * and trick those clicks. `frame-ancestors 'self'` (and `X-Frame-Options:
 * SAMEORIGIN` for older browsers) allows only our own pages to frame us. It
 * is not `'none'` because Firebase sign-in loads `/__/auth/iframe` from the
 * auth domain in a hidden frame, and in production that domain is this site
 * (PRE-374). Same-origin framing is not a clickjacking risk.
 *
 * Only `frame-ancestors` is set in the CSP. It does not limit which scripts or
 * frames our pages load, so RevenueCat and Stripe checkout frames, Google and
 * Apple sign-in popups, PostHog and the Meta Pixel are unaffected.
 *
 * HSTS leaves out `includeSubDomains` and `preload`: other tryprepit.app
 * subdomains (the API, analytics proxy, email link tracking) are not run from
 * here, and preloading can't be undone quickly.
 *
 * Kept free of Next imports: next.config.ts and the unit tests import it.
 */
export const SECURITY_HEADERS: readonly { key: string; value: string }[] = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

/** Next.js `headers()` entry that applies the security headers to every path. */
export function securityHeadersRule(): { source: string; headers: { key: string; value: string }[] } {
  return { source: "/:path*", headers: [...SECURITY_HEADERS] };
}
