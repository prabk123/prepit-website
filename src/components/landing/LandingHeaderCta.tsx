"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppStoreLink from "@/components/AppStoreLink";
import { landingBridgeHref, LANDING_FUNNEL_ID } from "@/lib/funnel/landing";
import { LANDING_EVENTS, trackLandingEvent, visitorCountry } from "@/lib/landingAnalytics";
import { webMarketFor, type WebMarket } from "@/lib/markets";

/**
 * The header button on the landing page (PRE-302, PRE-331). Web checkout
 * visitors (every country for now) go to the bridge, like every other button on the page, so the header doesn't leak
 * them to the App Store; App Store markets keep "Get the app"; elsewhere it's
 * the waitlist. The market comes from the cookie the proxy sets, so nothing
 * renders until it has been read, rather than flashing the App Store link.
 */
export default function LandingHeaderCta({ className, trackingSource }: { className: string; trackingSource: string }) {
  const [market, setMarket] = useState<WebMarket | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the cookie is only readable in the browser
    setMarket(webMarketFor(visitorCountry()));
  }, []);

  if (market === null) return null;
  if (market === "app-store") {
    return (
      <AppStoreLink trackingSource={trackingSource} className={className}>
        Get the app
      </AppStoreLink>
    );
  }
  return (
    <Link
      href={market === "web" ? landingBridgeHref() : "/waitlist"}
      className={className}
      onClick={() => trackLandingEvent(LANDING_EVENTS.ctaClick, market, { placement: "header", funnel_id: LANDING_FUNNEL_ID })}
    >
      {market === "web" ? (
        <>
          {/* The full label overlaps the logo on narrow phones. */}
          <span className="max-[419px]:hidden">Start my free 7 days</span>
          <span className="min-[420px]:hidden">Start free</span>
        </>
      ) : (
        "Join the waitlist"
      )}
    </Link>
  );
}
