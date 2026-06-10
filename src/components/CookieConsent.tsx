"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { isAnalyticsEnabled } from "@/lib/analytics";
import {
  COOKIE_MAX_AGE_ONE_YEAR,
  PREPIT_ANALYTICS_CONSENT_COOKIE,
  PREPIT_GEO_COOKIE,
  readCookie,
  setClientCookie,
} from "@/lib/cookies";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    const isEu = readCookie(PREPIT_GEO_COOKIE) === "eu";
    const consent = readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE);
    setVisible(isEu && consent !== "granted" && consent !== "denied");
  }, []);

  function acceptAnalytics() {
    setClientCookie(PREPIT_ANALYTICS_CONSENT_COOKIE, "granted", COOKIE_MAX_AGE_ONE_YEAR);
    posthog.opt_in_capturing();
    posthog.startSessionRecording();
    setVisible(false);
  }

  function rejectAnalytics() {
    setClientCookie(PREPIT_ANALYTICS_CONSENT_COOKIE, "denied", COOKIE_MAX_AGE_ONE_YEAR);
    posthog.opt_out_capturing();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[720px] rounded-2xl border border-black/10 bg-white p-5 shadow-lg sm:inset-x-6"
    >
      <p className="text-sm leading-relaxed text-black/80">
        We use cookies and similar technologies to understand how our website is used and to
        improve PrepIt. Analytics cookies are optional. See our{" "}
        <Link href="/cookie-policy" className="underline underline-offset-2">
          Cookie Policy
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={rejectAnalytics}
          className="rounded-2xl border border-black/15 px-4 py-3 text-sm font-medium text-black transition-opacity hover:opacity-80"
        >
          Reject optional cookies
        </button>
        <button
          type="button"
          onClick={acceptAnalytics}
          className="rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
        >
          Accept optional cookies
        </button>
      </div>
    </div>
  );
}
