"use client";

import Link from "next/link";
import AppStoreLink from "@/components/AppStoreLink";
import { AppleLogo } from "@/components/ui/AppStoreButton";
import { bridgePath } from "@/lib/funnel/params";
import type { WebMarket } from "@/lib/markets";
import { QUIZ_FUNNEL_ID } from "@/lib/quiz/quiz";

/**
 * "Start my free 7 days" at the end of the quiz and on the plan email's page.
 * Like the landing page's button (LandingCta), it follows the visitor's
 * market (PRE-331): the bridge (/start) where the website sells, the App
 * Store in the markets waiting on web checkout, the waitlist elsewhere. The
 * proxy sends /start back to the landing page outside the US, so linking
 * there from the quiz would land a UK visitor on /try.
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
        Start my free 7 days
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
      Start my free 7 days
    </Link>
  );
}
