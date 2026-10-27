import type { CaptureResult, PostHog } from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";
import { PREPIT_ANALYTICS_CONSENT_COOKIE, PREPIT_GEO_COOKIE, readCookie } from "@/lib/cookies";
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
  });
}

/** The visitor rejected analytics. PostHog is only touched if it already loaded. */
export function denyAnalyticsConsent() {
  instance?.opt_out_capturing();
}
