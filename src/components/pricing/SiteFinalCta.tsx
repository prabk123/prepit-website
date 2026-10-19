"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Pages that end with their own download band: shared plans ("Make your own
 * plan"), each guide and each feature page (the same band, counted per
 * page). The guides and features indexes keep the site band.
 */
const OWN_CLOSING_CTA_PREFIXES = ["/sharable/", "/guides/", "/features/"];

/** Single-action pages with no download band at all (the sign-in email link). */
const NO_CLOSING_CTA_PREFIXES = ["/auth/"];

/**
 * Shows the site's closing download section on every page except those that
 * already end with their own, so no page has two.
 */
export default function SiteFinalCta({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (
    [...OWN_CLOSING_CTA_PREFIXES, ...NO_CLOSING_CTA_PREFIXES].some((prefix) =>
      pathname.startsWith(prefix),
    )
  ) {
    return null;
  }
  // A page with its own App Store button but no path of its own (the 404)
  // marks itself with data-hide-site-final-cta, and globals.css hides this.
  return <div className="site-final-cta">{children}</div>;
}
