/**
 * Firebase's sign-in handler served from the website's own domain (PRE-374).
 *
 * Google and Apple show the address of the page that receives the sign-in
 * ("to continue to …"). With the auth domain on `<project>.firebaseapp.com`
 * that was `fresca-dev.firebaseapp.com`. The site proxies Firebase's handler
 * paths to that host instead, so with `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` set
 * to `www.tryprepit.app` the popup and the Google and Apple screens show
 * PrepIt's address. This is Firebase's "proxy auth requests to
 * firebaseapp.com" option; the Firebase project and the app's native sign-in
 * don't change.
 *
 * Kept free of Next and browser imports: next.config.ts and the unit tests
 * import it directly.
 */

/** The Firebase project the website signs in to when no env value names one. */
export const DEFAULT_FIREBASE_PROJECT_ID = "fresca-dev";

/** Paths Firebase's sign-in handler serves (the handler, its iframe and scripts, and the web config it reads). */
export const FIREBASE_AUTH_HANDLER_SOURCES = ["/__/auth/:path*", "/__/firebase/init.json"] as const;

/** `https://<project>.firebaseapp.com`, where Firebase Hosting serves the sign-in handler. */
export function firebaseHostingOrigin(projectId?: string | null): string {
  const id = projectId?.trim() || DEFAULT_FIREBASE_PROJECT_ID;
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Invalid Firebase project id: ${id}`);
  return `https://${id}.firebaseapp.com`;
}

/** Next.js rewrites that serve Firebase's sign-in handler from this site. */
export function firebaseAuthHandlerRewrites(projectId?: string | null): { source: string; destination: string }[] {
  const origin = firebaseHostingOrigin(projectId);
  return FIREBASE_AUTH_HANDLER_SOURCES.map((source) => ({ source, destination: `${origin}${source}` }));
}

/**
 * Where sign-in is handled, for analytics: `firebase` while the auth domain is
 * Firebase's own host (Google shows `<project>.firebaseapp.com`), `prepit`
 * once it is the site's domain.
 */
export function authDomainKind(authDomain: string | undefined | null): "prepit" | "firebase" {
  const host = authDomain?.trim().toLowerCase() ?? "";
  if (!host || host.endsWith(".firebaseapp.com") || host.endsWith(".web.app")) return "firebase";
  return "prepit";
}
