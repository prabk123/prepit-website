"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackRoutePageView } from "@/lib/metaPixel";
import { isNewMetaPage, metaPixelBlockedPage } from "@/lib/metaPixelRoutes";

/**
 * A Meta PageView for each page the site moves to without a reload (PRE-568).
 * The pixel snippet in layout.tsx sends the first one when it loads, so the
 * first page is skipped here. Nothing is sent while the pixel isn't loaded
 * (no consent in the UK and EEA, opted out, or GPC), and never for pages with
 * a token in the address.
 */
export default function MetaPageViews() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const last = previous.current;
    previous.current = pathname;
    if (!isNewMetaPage(last, pathname)) return;
    if (metaPixelBlockedPage(window.location.pathname, window.location.search)) return;
    trackRoutePageView();
  }, [pathname]);

  return null;
}
