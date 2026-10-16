"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isAnalyticsEnabled } from "@/lib/analytics";
import { denyAnalyticsConsent, grantAnalyticsConsent } from "@/lib/posthogClient";
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

// Accept and Reject look the same, so neither choice is pushed (ICO guidance).
const buttonClass =
  "inline-flex h-11 flex-1 items-center justify-center rounded-button border border-line-strong px-5 text-small font-bold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus sm:flex-none";

/** After a choice, focus goes to the page content instead of dropping to <body>. */
function focusMain() {
  document.getElementById("main")?.focus({ preventScroll: true });
}

/**
 * UK and EEA visitors choose here before optional cookies (PostHog, Meta Pixel)
 * are set. The root layout renders it first in <body>, so it is the first
 * thing a keyboard reaches; focus is not trapped.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    // No geo cookie counts as needing consent, like the proxy and PostHog.
    const needsConsent = readCookie(PREPIT_GEO_COOKIE) !== "non-eu";
    const consent = readCookie(PREPIT_ANALYTICS_CONSENT_COOKIE);
    setVisible(needsConsent && consent !== "granted" && consent !== "denied");
  }, []);

  function acceptAnalytics() {
    setClientCookie(PREPIT_ANALYTICS_CONSENT_COOKIE, "granted", COOKIE_MAX_AGE_ONE_YEAR);
    grantAnalyticsConsent();
    window.prepitLoadMetaPixel?.();
    setVisible(false);
    focusMain();
  }

  function rejectAnalytics() {
    setClientCookie(PREPIT_ANALYTICS_CONSENT_COOKIE, "denied", COOKIE_MAX_AGE_ONE_YEAR);
    denyAnalyticsConsent();
    setVisible(false);
    focusMain();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[720px] rounded-tile border border-line-strong bg-surface p-4 text-ink shadow-phone sm:inset-x-6 sm:p-6"
    >
      <p className="text-small text-ink-secondary text-pretty">
        We use optional analytics and ad cookies to improve the site and our ads. They stay off
        unless you accept. See our{" "}
        <Link
          href="/cookie-policy"
          className="text-ink underline decoration-accent underline-offset-4 hover:text-accent-text"
        >
          Cookie Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-3 sm:mt-4 sm:justify-end">
        <button type="button" onClick={rejectAnalytics} className={buttonClass}>
          <span className="sm:hidden">Reject</span>
          <span className="hidden sm:inline">Reject optional cookies</span>
        </button>
        <button type="button" onClick={acceptAnalytics} className={buttonClass}>
          <span className="sm:hidden">Accept</span>
          <span className="hidden sm:inline">Accept optional cookies</span>
        </button>
      </div>
    </div>
  );
}
