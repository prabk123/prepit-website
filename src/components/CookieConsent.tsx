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

declare global {
  interface Window {
    /** Defined by the Meta Pixel script in the root layout when a pixel id is set. */
    prepitLoadMetaPixel?: () => void;
  }
}

const buttonClass =
  "inline-flex h-11 items-center justify-center rounded-control px-5 text-small font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream";

/** UK and EEA visitors choose here before optional cookies (PostHog, Meta Pixel) are set. */
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
    window.prepitLoadMetaPixel?.();
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
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[720px] rounded-tile border border-line-strong bg-surface-raised p-5 text-ink [color-scheme:dark] shadow-phone sm:inset-x-6 sm:p-6"
    >
      <p className="text-small text-ink-secondary text-pretty">
        We use optional analytics and advertising cookies to see how our website is used and
        whether our ads work. They stay off unless you accept. See our{" "}
        <Link
          href="/cookie-policy"
          className="text-ink underline decoration-energy underline-offset-4 hover:text-energy"
        >
          Cookie Policy
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={rejectAnalytics}
          className={`${buttonClass} border border-line-strong text-ink`}
        >
          Reject optional cookies
        </button>
        <button
          type="button"
          onClick={acceptAnalytics}
          className={`${buttonClass} bg-cream text-on-cream`}
        >
          Accept optional cookies
        </button>
      </div>
    </div>
  );
}
