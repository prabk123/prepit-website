export const PREPIT_GEO_COOKIE = "prepit-geo";
export const PREPIT_ANALYTICS_CONSENT_COOKIE = "prepit-analytics-consent";

export const COOKIE_MAX_AGE_ONE_YEAR = 60 * 60 * 24 * 365;

export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

export function setClientCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

/** "1" once this browser chose "Opt out of sharing" on /privacy-choices (PRE-539). */
export const PREPIT_PRIVACY_OPT_OUT_COOKIE = "prepit-privacy-opt-out";

/**
 * Expires a cookie on this host and on the parent domains it could have been
 * set on (the Meta Pixel sets `_fbp` on `.tryprepit.app`).
 */
export function expireClientCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  const parts = location.hostname.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    document.cookie = `${name}=; path=/; max-age=0; domain=.${parts.slice(i).join(".")}; SameSite=Lax`;
  }
}
