"use client";

import Link from "next/link";
import { START_LABEL } from "@/components/landing/LandingCta";
import { bridgePath } from "@/lib/funnel/params";
import type { WebMarket } from "@/lib/markets";
import { QUIZ_FUNNEL_ID } from "@/lib/quiz/quiz";

/**
 * "Start my free 7 days" on the plan email's page (/my-plan). The quiz itself
 * hands off on its own once its loader ends (PRE-446).
 * Like the landing page's button (LandingCta), it follows the visitor's
 * market (PRE-331): the bridge (/start) where the website sells (every
 * country for now), the waitlist for a country or region listed in
 * lib/markets.ts. The proxy sends those away from /start, so the quiz must
 * not link there for them. There is no App Store button (PRE-448).
 */
export default function QuizStartCta({
  market,
  className,
  onStart,
}: {
  market: WebMarket;
  className: string;
  /** Runs on tap, before the page changes. */
  onStart?: () => void;
}) {
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
