"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { mayKeepAttribution } from "@/lib/funnel/attributionStore";
import { trackRoutePageView } from "@/lib/metaPixel";
import { isNewMetaPage, metaPixelBlockedPage } from "@/lib/metaPixelRoutes";

/**
 * A Meta PageView for each page the site moves to without a reload (PRE-568).
 * The pixel's own history tracking is off (`fbq.disablePushState` in
 * layout.tsx), so this is the only source of these PageViews: one per new
 * page, never for a change of query alone, and never for pages with a token in
 * the address. The snippet sends the first page's PageView, so the first page
 * is skipped here.
 *
 * Same rules as the pixel itself: nothing without consent in the UK and EEA,
 * and nothing once this browser opts out of sharing or sends GPC in the US,
 * even if the pixel loaded earlier on the visit. A visit that started on a
 * token page never loaded the pixel; the first allowed page loads it, and the
 * snippet sends that page's PageView.
 */
export default function MetaPageViews() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const last = previous.current;
    previous.current = pathname;
    if (!isNewMetaPage(last, pathname)) return;
    if (metaPixelBlockedPage(window.location.pathname, window.location.search)) return;
    if (!mayKeepAttribution()) return;
    if (typeof window.fbq !== "function") {
      window.prepitLoadMetaPixel?.();
      return;
    }
    trackRoutePageView();
  }, [pathname]);

  return null;
}
