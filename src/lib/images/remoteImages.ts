/**
 * Remote images the site's image optimiser (`/_next/image`) will fetch
 * (PRE-380).
 *
 * The only remote images are recipe photos on shared plans. The backend stores
 * them under `AWS_IMAGE_BASE_URL`, which is the `images.m1a.dev` CDN (the
 * backend's own `/images/optimise` allows only that origin). A recipe image
 * saved as a relative path is prefixed with `PREPIT_API_BASE_URL`, so the two
 * API hosts stay too.
 *
 * Anything else, such as a raw `*.amazonaws.com` URL from an upload made
 * while `AWS_IMAGE_BASE_URL` was unset, is shown with `unoptimized`: the
 * browser loads it directly, so the optimiser never fetches a host outside
 * this list and can't be used as an open image proxy.
 *
 * Kept free of Next and browser imports: next.config.ts and the unit tests
 * import it directly.
 */
export const OPTIMISED_IMAGE_HOSTS = ["images.m1a.dev", "api.tryprepit.app", "api.m1a.dev"] as const;

/** `images.remotePatterns` for next.config.ts: HTTPS on the hosts above, nothing else. */
export function optimisedImageRemotePatterns(): { protocol: "https"; hostname: string; pathname: string }[] {
  return OPTIMISED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https", hostname, pathname: "/**" }));
}

/**
 * Whether `/_next/image` may optimise `src`. Site-relative paths (`/logo.png`)
 * are local images and always can; a remote URL only when it is HTTPS on one
 * of the hosts above.
 */
export function canOptimiseImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && (OPTIMISED_IMAGE_HOSTS as readonly string[]).includes(url.hostname);
  } catch {
    return false;
  }
}
