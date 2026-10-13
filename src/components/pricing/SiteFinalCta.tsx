"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Pages that end with their own download band: shared plans ("Make your own
 * plan"), each guide and each feature page (the same band, counted per
 * page). The guides index keeps the site band.
 */
const OWN_CLOSING_CTA_PREFIXES = ["/sharable/", "/guides/", "/features/"];

/**
 * Shows the site's closing download section on every page except those that
 * already end with their own, so no page has two.
 */
export default function SiteFinalCta({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (OWN_CLOSING_CTA_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;
  return children;
}
