"use client";

import Link from "next/link";
import { PILL_BUTTON_CLASS } from "@/components/ui/buttons";
import { useLandingSurface } from "@/components/landing/LandingSurface";
import { landingBridgeHref } from "@/lib/funnel/landing";
import { LANDING_EVENTS, trackLandingEvent } from "@/lib/landingAnalytics";
import type { WebMarket } from "@/lib/markets";

export const START_LABEL = "Start my free 7 days";

type LandingCtaProps = {
  market: WebMarket;
  /**
   * Where the button sits, for analytics: hero, plans, pricing, closing,
   * sticky. Also set as `data-cta="<placement>_start_trial"` on the button.
   * On the homepage both get a `home_` prefix (LandingSurface, PRE-444).
   */
  placement: string;
  /** Stretch to the container, as in the price card. */
  fullWidth?: boolean;
  /** The compact size, for the phone's sticky bar. */
  small?: boolean;
  /** A shorter label where the website sells, as on the phone's sticky bar ("Start free"). */
  label?: string;
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
 * in, choose a plan, pay $0); in a waitlist country or region it goes to the
 * waitlist. There is no App Store button (PRE-448).
 */
export default function LandingCta({ market, placement: where, fullWidth, small, label, className }: LandingCtaProps) {
  const surface = useLandingSurface();
  const placement = `${surface.placementPrefix}${where}`;
  const size = small ? "!h-11 !px-4 !text-small" : "";
  const width = fullWidth ? "w-full justify-center" : "";
  return (
    <Link
      href={market === "web" ? landingBridgeHref(surface.funnelId) : "/waitlist"}
      className={`${PILL_BUTTON_CLASS} ${size} ${width} ${className ?? ""}`}
      data-cta={`${placement}_start_trial`}
      onClick={() => trackLandingEvent(LANDING_EVENTS.ctaClick, market, { placement, funnel_id: surface.funnelId })}
    >
      {market === "web" ? (label ?? START_LABEL) : "Join the waitlist"}
      {!small && <Arrow />}
    </Link>
  );
}

/**
 * "Not sure yet? Take the quiz first." under the closing button: the later
 * test arm (Charlie's decision D4), off at launch. Clicks report as
 * `web_landing_cta_click` with placement `closing_quiz`.
 */
export function LandingQuizLink({ market }: { market: WebMarket }) {
  const surface = useLandingSurface();
  const placement = `${surface.placementPrefix}closing_quiz`;
  return (
    <p className="text-body text-ink-secondary">
      Not sure yet?{" "}
      <Link
        href="/quiz"
        data-cta={placement}
        className="font-medium text-ink underline underline-offset-4"
        onClick={() => trackLandingEvent(LANDING_EVENTS.ctaClick, market, { placement, funnel_id: surface.funnelId })}
      >
        Take the quiz first
      </Link>
    </p>
  );
}
