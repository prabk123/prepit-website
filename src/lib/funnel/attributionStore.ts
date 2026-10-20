/**
 * Where this tab's first-touch attribution (attribution.ts) is kept, and the
 * consent rule for keeping it. Until a visitor may be tracked the landing is
 * held in memory only, so accepting optional cookies on a later page of the
 * same visit still keeps it.
 */
import { PREPIT_ANALYTICS_CONSENT_COOKIE, PREPIT_GEO_COOKIE, readCookie } from "@/lib/cookies";
import { parseAttribution, QUERY_FIELDS, type Attribution } from "./attribution";

const STORAGE_KEY = "prepit.attribution.v1";

/** The same rule as PostHog: a known non-EU visitor, or one who accepted optional cookies. */
export function mayKeepAttribution(): boolean {
  return readCookie(PREPIT_GEO_COOKIE) === "non-eu" || readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE) === "granted";
}

/** This visit's landing, held in memory until the visitor consents. */
let pendingLanding: Attribution | null = null;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

/** The attribution kept for this tab, or null (always null without consent). */
export function readAttribution(): Attribution | null {
  if (!mayKeepAttribution()) return null;
  try {
    const raw = storage()?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    // Only known string fields come back out.
    const attribution: Attribution = {};
    for (const [, field, max] of QUERY_FIELDS) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === "string" && value) attribution[field] = value.slice(0, max);
    }
    for (const field of ["referrer", "landingPath"] as const) {
      const value = (parsed as Record<string, unknown>)[field];
      if (typeof value === "string" && value) attribution[field] = value.slice(0, 500);
    }
    return Object.keys(attribution).length > 0 ? attribution : null;
  } catch {
    return null;
  }
}

/**
 * Keeps the first attribution in this tab (first touch, as the backend does).
 * Later pages, including a second campaign landing, leave it as it is.
 */
export function captureAttribution(location: { search: string; pathname: string; host: string }, referrer: string) {
  if (pendingLanding) return;
  const landed = parseAttribution(location.search, location.pathname, referrer, location.host);
  if (!landed) return;
  pendingLanding = landed;
  keepPendingAttribution();
}

/** Stores the held landing once the visitor may be tracked. Called on landing and on "Accept optional cookies". */
export function keepPendingAttribution() {
  const store = storage();
  if (!pendingLanding || !store || !mayKeepAttribution() || readAttribution()) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(pendingLanding));
  } catch {
    // Storage full or blocked: the funnel works without attribution.
  }
}

/** "Reject optional cookies": nothing is kept or sent. */
export function forgetAttribution() {
  pendingLanding = null;
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
}
