/**
 * Hosts whose requests carry PostHog's tracing headers (PRE-521). posthog-js
 * adds `X-POSTHOG-SESSION-ID`, `X-POSTHOG-WINDOW-ID` and
 * `X-POSTHOG-DISTINCT-ID` to fetch and XHR calls whose hostname is in its
 * `tracing_headers` list, so the backend's trace of the call links to the
 * visitor's session replay. The headers are analytics context only; the
 * backend never treats them as identity.
 *
 * Built from the PrepIt API and connector URLs the site is configured with,
 * so previews link to the dev API and production to api.tryprepit.app. Only
 * https URLs count, plus http on localhost for local development. Kept free
 * of imports so the unit tests can load it.
 */
export function tracingHeaderHosts(urls: ReadonlyArray<string | null | undefined>): string[] {
  const hosts = new Set<string>();
  for (const raw of urls) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      const local = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
      if (url.protocol === "https:" || local) hosts.add(url.hostname.toLowerCase());
    } catch {
      // Not a URL: no headers for it.
    }
  }
  return [...hosts];
}
