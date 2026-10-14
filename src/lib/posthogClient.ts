import type { PostHog } from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";
import { PREPIT_ANALYTICS_CONSENT_COOKIE, PREPIT_GEO_COOKIE, readCookie } from "@/lib/cookies";

/**
 * PostHog is about 190 KB of script, so it stays off the first paint: it loads
 * once the page has finished loading and the browser is idle, on the visitor's
 * first tap, key or scroll, or straight away when a call needs it now (an App
 * Store tap that is about to leave the page). Events captured before then wait
 * in a queue and are sent once it is ready.
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

function needsConsent(): boolean {
  return readCookie(PREPIT_GEO_COOKIE) === "eu";
}

function hasConsent(): boolean {
  return readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE) === "granted";
}

/** True when this visitor's events may be sent at all. */
function mayCapture(): boolean {
  if (typeof window === "undefined" || !isPostHogEnabled()) return false;
  return !needsConsent() || hasConsent();
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
      session_recording: {
        maskAllInputs: true,
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
 * the visitor hasn't consented. `now` loads it at once instead of waiting for
 * the idle load, for events sent just before the visitor leaves the page.
 */
export function withPostHog(call: PostHogCall, { now = false }: { now?: boolean } = {}) {
  if (!mayCapture()) return;
  if (instance) {
    call(instance);
    return;
  }
  queue.push(call);
  if (now) void load();
  else schedulePostHog();
}

/** The visitor accepted analytics in the cookie banner. */
export function grantAnalyticsConsent() {
  if (!isPostHogEnabled()) return;
  void load().then((posthog) => {
    posthog.opt_in_capturing();
    posthog.startSessionRecording();
  });
}

/** The visitor rejected analytics. PostHog is only touched if it already loaded. */
export function denyAnalyticsConsent() {
  instance?.opt_out_capturing();
}
