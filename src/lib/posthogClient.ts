import type { CaptureResult, PostHog } from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";
import { resolveMcpIssuer } from "@/lib/connector/connectParams";
import { PREPIT_ANALYTICS_CONSENT_COOKIE, PREPIT_GEO_COOKIE, readCookie } from "@/lib/cookies";
import { tracingHeaderHosts } from "@/lib/tracingHeaders";
import { withoutUrlSecrets } from "@/lib/urlTokens";

/**
 * PostHog is about 190 KB of script, so it stays off the first paint: it loads
 * once the page has finished loading and the browser is idle, on the visitor's
 * first tap, key or scroll, or straight away for an App Store tap that is about
 * to leave the page. Events captured before then wait in a queue and are sent
 * once it is ready.
 *
 * EU and UK visitors who haven't accepted analytics never load it, so nothing
 * runs or is stored for them until they accept in the cookie banner.
 */

type PostHogCall = (posthog: PostHog) => void;

let instance: PostHog | null = null;
let loading: Promise<PostHog> | null = null;
let scheduled = false;
const queue: PostHogCall[] = [];

/** The latest idle wait after load before PostHog loads anyway. */
const IDLE_TIMEOUT_MS = 4000;

/** Only a known non-EU visitor skips consent; a missing or unknown region needs it (as in lib/geo). */
function needsConsent(): boolean {
  return readCookie(PREPIT_GEO_COOKIE) !== "non-eu";
}

function hasConsent(): boolean {
  return readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE) === "granted";
}

/** True when this visitor's events may be sent at all. */
function mayCapture(): boolean {
  if (typeof window === "undefined" || !isPostHogEnabled()) return false;
  return !needsConsent() || hasConsent();
}

/**
 * The PrepIt API and connector hosts, whose calls carry PostHog's session
 * headers so backend traces open from the session replay (PRE-521). Only
 * while PostHog may capture: a visitor who turns analytics down sends none.
 */
function tracingHosts(): string[] {
  return tracingHeaderHosts([
    process.env.NEXT_PUBLIC_PREPIT_API_BASE_URL,
    resolveMcpIssuer(process.env.NEXT_PUBLIC_MCP_OAUTH_ISSUER),
  ]);
}

/** Takes link credentials (`?token=`, a sign-in `?oobCode=`) out of every URL an event carries. */
function stripUrlSecrets(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  for (const bag of [event.properties, event.$set, event.$set_once]) {
    if (!bag) continue;
    for (const [key, value] of Object.entries(bag)) {
      if (typeof value === "string") bag[key] = withoutUrlSecrets(value);
    }
  }
  return event;
}

function load(): Promise<PostHog> {
  loading ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://b.tryprepit.app",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST,
      defaults: "2026-01-30",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      before_send: stripUrlSecrets,
      session_recording: {
        maskAllInputs: true,
      },
      tracing_headers: tracingHosts(),
      // A visitor PostHog remembers as opted out sends no session headers either.
      loaded: (loaded) => {
        if (loaded.has_opted_out_capturing()) loaded.set_config({ tracing_headers: [] });
      },
      debug: process.env.NODE_ENV === "development",
    });
    instance = posthog;
    for (const call of queue.splice(0)) call(posthog);
    return posthog;
  });
  return loading;
}

/** Called once from instrumentation-client: load PostHog when the page is idle. */
export function schedulePostHog() {
  if (scheduled || !mayCapture()) return;
  scheduled = true;

  const whenIdle = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => void load(), { timeout: IDLE_TIMEOUT_MS });
    } else {
      setTimeout(() => void load(), 1);
    }
  };

  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });

  // A visitor who starts using the page before then gets it straight away, so
  // their events (an App Store tap above all) are less likely to be lost.
  for (const event of ["pointerdown", "keydown", "scroll"] as const) {
    window.addEventListener(event, () => void load(), { once: true, passive: true });
  }
}

/**
 * Run `call` with PostHog once it has loaded. Dropped when analytics is off or
 * the visitor hasn't consented.
 */
export function withPostHog(call: PostHogCall) {
  if (!mayCapture()) return;
  if (instance) {
    call(instance);
    return;
  }
  queue.push(call);
  schedulePostHog();
}

/** True while this visitor's events are allowed but PostHog hasn't loaded yet. */
export function isPostHogPending(): boolean {
  return mayCapture() && !instance;
}

/**
 * Load PostHog and run `call`, resolving once it has run or after `timeoutMs`,
 * whichever is first. For an event sent just before the page navigates away.
 */
export function withPostHogBeforeLeaving(call: PostHogCall, timeoutMs = 500): Promise<void> {
  if (!mayCapture()) return Promise.resolve();
  if (instance) {
    call(instance);
    return Promise.resolve();
  }
  const sent = new Promise<void>((resolve) => {
    queue.push((posthog) => {
      call(posthog);
      resolve();
    });
  });
  void load();
  return Promise.race([sent, new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))]);
}

/** The visitor accepted analytics in the cookie banner. */
export function grantAnalyticsConsent() {
  if (!isPostHogEnabled()) return;
  void load().then((posthog) => {
    posthog.opt_in_capturing();
    posthog.startSessionRecording();
    // Back on after an earlier no in this tab (denyAnalyticsConsent).
    if (!posthog.config.tracing_headers?.length) posthog.set_config({ tracing_headers: tracingHosts() });
  });
}

/**
 * The visitor rejected analytics. PostHog is only touched if it has loaded or
 * is loading (then once it's ready, so a load already under way can't leave it on).
 */
export function denyAnalyticsConsent() {
  void loading?.then((posthog) => {
    posthog.opt_out_capturing();
    // Opting out doesn't stop posthog-js adding its session headers to API
    // calls, so turn them off too (PRE-521).
    posthog.set_config({ tracing_headers: [] });
  });
}
