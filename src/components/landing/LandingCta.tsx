"use client";

import Link from "next/link";
import AppStoreButton from "@/components/ui/AppStoreButton";
import { PILL_BUTTON_CLASS } from "@/components/ui/buttons";
import { landingBridgeHref, LANDING_FUNNEL_ID } from "@/lib/funnel/landing";
import { LANDING_EVENTS, trackLandingEvent } from "@/lib/landingAnalytics";
import type { WebMarket } from "@/lib/markets";

export const START_LABEL = "Start my free 7 days";

type LandingCtaProps = {
  market: WebMarket;
  /** Where the button sits, for analytics: hero, week, plans, pricing, closing, sticky. */
  placement: string;
  /** Stretch to the container, as in the price card. */
  fullWidth?: boolean;
  /** The compact size, for the phone's sticky bar. */
  small?: boolean;
  className?: string;
};

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * "Start my free 7 days" on the landing page (PRE-302, PRE-331). Where the
 * website sells (every country for now) it opens the shared bridge (sign
 * in, choose a plan, pay $0); in a country listed for the App Store it is
 * the App Store button; in a waitlist country it goes to the waitlist.
 */
export default function LandingCta({ market, placement, fullWidth, small, className }: LandingCtaProps) {
  if (market === "app-store") {
    return (
      <div className={className}>
        <AppStoreButton trackingSource={`landing-${placement}`} label={START_LABEL} />
      </div>
    );
  }

  const size = small ? "!h-11 !px-4 !text-small" : "";
  const width = fullWidth ? "w-full justify-center" : "";
  return (
    <Link
      href={market === "web" ? landingBridgeHref() : "/waitlist"}
      className={`${PILL_BUTTON_CLASS} ${size} ${width} ${className ?? ""}`}
      onClick={() => trackLandingEvent(LANDING_EVENTS.ctaClick, market, { placement, funnel_id: LANDING_FUNNEL_ID })}
    >
      {market === "web" ? START_LABEL : "Join the waitlist"}
      {!small && <Arrow />}
    </Link>
  );
}
