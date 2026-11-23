/**
 * Where this tab's first-touch attribution (attribution.ts) is kept, and the
 * consent rule for keeping it. Until a visitor may be tracked the landing is
 * held in memory only, so accepting optional cookies on a later page of the
 * same visit still keeps it.
 */
import { PREPIT_ANALYTICS_CONSENT_COOKIE, PREPIT_GEO_COOKIE, readCookie } from "@/lib/cookies";
import { isOptedOutOfSharing } from "@/lib/privacyChoices";
import {
  attributionEventProperties,
  isEntryLoad,
  landingPageFor,
  parseAttribution,
  QUERY_FIELDS,
  type Attribution,
} from "./attribution";

const STORAGE_KEY = "prepit.attribution.v1";
/** The first page of this tab ("/try", "/quiz"…), with or without a campaign (PRE-571). */
const LANDING_KEY = "prepit.landing.v1";

/**
 * The same rule as PostHog (a known non-EU visitor, or one who accepted
 * optional cookies), unless this browser opted out of sharing on
 * /privacy-choices or is a US browser sending Global Privacy Control
 * (PRE-539). Also gates the Meta matching details given to RevenueCat.
 */
export function mayKeepAttribution(): boolean {
  if (isOptedOutOfSharing()) return false;
  return readCookie(PREPIT_GEO_COOKIE) === "non-eu" || readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE) === "granted";
}

/** This visit's landing, held in memory until the visitor consents. */
let pendingLanding: Attribution | null = null;
/** This tab's first page, held in memory until the visitor consents. */
let pendingLandingPage: string | null = null;

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
  // Only a load from outside (no referrer, or another site) is an entry. A
  // reload or a sign-in or checkout redirect before consent would otherwise
  // be taken for the landing page.
  if (!pendingLandingPage && isEntryLoad(referrer, location.host)) {
    pendingLandingPage = landingPageFor(location.pathname) ?? null;
    keepPendingLandingPage();
  }
  if (pendingLanding) return;
  const landed = parseAttribution(location.search, location.pathname, referrer, location.host);
  if (!landed) return;
  pendingLanding = landed;
  keepPendingAttribution();
}

/** The tab's first page, or null (always null without consent). */
export function readLandingPage(): string | null {
  if (!mayKeepAttribution()) return null;
  try {
    return landingPageFor(storage()?.getItem(LANDING_KEY)) ?? null;
  } catch {
    return null;
  }
}

/** Keeps the tab's first page; a reload of a later page leaves it as it is. */
function keepPendingLandingPage() {
  const store = storage();
  if (!pendingLandingPage || !store || !mayKeepAttribution() || readLandingPage()) return;
  // A tab that kept a campaign landing before this key existed keeps that page.
  const landed = landingPageFor(readAttribution()?.landingPath) ?? pendingLandingPage;
  try {
    store.setItem(LANDING_KEY, landed);
  } catch {
    // Storage full or blocked: events go without a landing page.
  }
}

/** Campaign and landing page properties for this tab's analytics events (PRE-571). */
export function campaignEventProperties(): Record<string, string> {
  return attributionEventProperties(readAttribution(), readLandingPage());
}

/** Stores the held landing once the visitor may be tracked. Called on landing and on "Accept optional cookies". */
export function keepPendingAttribution() {
  keepPendingLandingPage();
  const store = storage();
  if (!pendingLanding || !store || !mayKeepAttribution() || readAttribution()) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(pendingLanding));
  } catch {
    // Storage full or blocked: the funnel works without attribution.
  }
}

/** "Reject optional cookies" or "Opt out of sharing": nothing is kept or sent. */
export function forgetAttribution() {
  pendingLanding = null;
  pendingLandingPage = null;
  for (const key of [STORAGE_KEY, LANDING_KEY]) {
    try {
      storage()?.removeItem(key);
    } catch {
      // Nothing stored.
    }
  }
}
