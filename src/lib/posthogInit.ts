import posthog from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";

let started = false;

/**
 * Starts PostHog. UK and EEA visitors (and unknown regions) only get here
 * after "Accept optional cookies", so PostHog sets no cookie and sends no
 * request before they choose. Everyone else starts on page load.
 */
export function initPostHog() {
  if (started || !isPostHogEnabled()) return;
  started = true;
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
}
