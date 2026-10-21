"use client";

import { useEffect, useRef } from "react";
import { LANDING_FUNNEL_ID } from "@/lib/funnel/landing";
import { LANDING_EVENTS, trackLandingEvent } from "@/lib/landingAnalytics";
import type { WebMarket } from "@/lib/markets";

/** Sends `web_landing_view` once per page view (PRE-302). */
export default function LandingViewTracker({ market }: { market: WebMarket }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackLandingEvent(LANDING_EVENTS.view, market, { funnel_id: LANDING_FUNNEL_ID });
  }, [market]);
  return null;
}
