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
