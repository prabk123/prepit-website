"use client";

import { createContext, useContext, type ReactNode } from "react";
import { HOME_FUNNEL_ID, LANDING_FUNNEL_ID } from "@/lib/funnel/landing";

/**
 * Which page the Landing v9 sections are on: the ad landing page (`/try`) or
 * the homepage (PRE-444). The buttons read it, so homepage clicks report as
 * `web_landing_cta_click` with a `home_` placement (and `data-cta`
 * `home_<placement>_start_trial`) and start in the homepage's own funnel.
 */
export type LandingSurfaceName = "try" | "home";

export type LandingSurface = {
  name: LandingSurfaceName;
  /** Put before every button's placement: "" on /try, "home_" on the homepage. */
  placementPrefix: string;
  funnelId: string;
  /** Put before App Store `trackingSource`s: "landing" or "home". */
  trackingPrefix: string;
};

const SURFACES: Record<LandingSurfaceName, LandingSurface> = {
  try: { name: "try", placementPrefix: "", funnelId: LANDING_FUNNEL_ID, trackingPrefix: "landing" },
  home: { name: "home", placementPrefix: "home_", funnelId: HOME_FUNNEL_ID, trackingPrefix: "home" },
};

const LandingSurfaceContext = createContext<LandingSurface>(SURFACES.try);

/** Wraps a page's Landing v9 sections. Without it, buttons behave as on /try. */
export function LandingSurfaceProvider({ surface, children }: { surface: LandingSurfaceName; children: ReactNode }) {
  return <LandingSurfaceContext.Provider value={SURFACES[surface]}>{children}</LandingSurfaceContext.Provider>;
}

export function useLandingSurface(): LandingSurface {
  return useContext(LandingSurfaceContext);
}
