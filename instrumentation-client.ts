import posthog from "posthog-js";
import { isPostHogEnabled } from "@/lib/analytics";
import {
  PREPIT_ANALYTICS_CONSENT_COOKIE,
  PREPIT_GEO_COOKIE,
  readCookie,
} from "@/lib/cookies";

const isEu = readCookie(PREPIT_GEO_COOKIE) === "eu";
const hasConsent = readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE) === "granted";

if (isPostHogEnabled()) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://b.tryprepit.app",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST,
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    opt_out_capturing_by_default: isEu && !hasConsent,
    session_recording: {
      maskAllInputs: true,
    },
    debug: process.env.NODE_ENV === "development",
  });
}
