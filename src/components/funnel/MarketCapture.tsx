"use client";

import { useEffect } from "react";
import { registerVisitorMarket } from "@/lib/landingAnalytics";

/** Adds the visitor's country and web market to every PostHog event (PRE-331). */
export default function MarketCapture() {
  useEffect(() => {
    registerVisitorMarket();
  }, []);
  return null;
}
