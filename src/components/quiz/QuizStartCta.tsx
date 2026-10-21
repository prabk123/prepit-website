"use client";

import Link from "next/link";
import AppStoreLink from "@/components/AppStoreLink";
import { START_LABEL } from "@/components/landing/LandingCta";
import { AppleLogo } from "@/components/ui/AppStoreButton";
import { bridgePath } from "@/lib/funnel/params";
import type { WebMarket } from "@/lib/markets";
import { QUIZ_FUNNEL_ID } from "@/lib/quiz/quiz";

/**
 * "Start my free 7 days" at the end of the quiz and on the plan email's page.
 * Like the landing page's button (LandingCta), it follows the visitor's
 * market (PRE-331): the bridge (/start) where the website sells (every
 * country for now), the App Store or the waitlist for a country listed in
 * lib/markets.ts. The proxy sends those countries away from /start, so the
 * quiz must not link there for them.
 */
export default function QuizStartCta({
  market,
  className,
  trackingSource,
  onStart,
}: {
  market: WebMarket;
  className: string;
  /** Sent with the `app_store_click` event, e.g. "quiz-result". */
  trackingSource: string;
  /** Runs on tap, before the page changes. */
  onStart?: () => void;
}) {
  if (market === "app-store") {
    return (
      <AppStoreLink trackingSource={trackingSource} className={className} onClick={onStart}>
        <AppleLogo />
        {START_LABEL}
      </AppStoreLink>
    );
  }
  if (market === "waitlist") {
    return (
      <Link href="/waitlist" className={className} onClick={onStart}>
        Join the waitlist
      </Link>
    );
  }
  return (
    <Link href={bridgePath({ from: "quiz", funnel: QUIZ_FUNNEL_ID })} className={className} onClick={onStart}>
      {START_LABEL}
    </Link>
  );
}
