"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import { HOME_FUNNEL_ID, LANDING_FUNNEL_ID, LANDING_PATH, SITE_FUNNEL_ID, landingBridgeHref } from "@/lib/funnel/landing";
import { LANDING_EVENTS, trackLandingEvent, visitorCountry } from "@/lib/landingAnalytics";
import { webMarketFor } from "@/lib/markets";

type StartTrialLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /**
   * Where the button sits, sent as `placement` with `web_landing_cta_click`
   * and set as `data-cta="<placement>_start_trial"`, e.g. "header-desktop",
   * "final-cta", "feature-meal-plans-hero". These are the sources the App
   * Store buttons used to send with `app_store_click` (PRE-448).
   */
  placement: string;
};

/** The funnel a site-wide button starts in: the page's own on /try and the homepage, else `site`. */
function funnelFor(pathname: string | null): string {
  if (pathname === LANDING_PATH) return LANDING_FUNNEL_ID;
  if (pathname === "/") return HOME_FUNNEL_ID;
  return SITE_FUNNEL_ID;
}

/**
 * A link into web checkout from anywhere on the site (PRE-448): the cart on
 * `/start`, which signs people in and then shows the paywall, like the
 * landing page's buttons. Every visitor starts on the website now; the site
 * has no App Store links before a purchase. A Quebec visitor is sent on to
 * the waitlist by the proxy, so the link doesn't need to know the market.
 */
export default function StartTrialLink({ placement, onClick, ...props }: StartTrialLinkProps) {
  const funnel = funnelFor(usePathname());
  return (
    <Link
      href={landingBridgeHref(funnel)}
      data-cta={`${placement}_start_trial`}
      onClick={(event) => {
        trackLandingEvent(LANDING_EVENTS.ctaClick, webMarketFor(visitorCountry()), { placement, funnel_id: funnel });
        onClick?.(event);
      }}
      {...props}
    />
  );
}
