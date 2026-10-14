"use client";

import { useEffect } from "react";
import { trackPageNotFound } from "@/lib/posthogAnalytics";

/** Sends `page_not_found` once when the 404 page shows, so broken links can be found. */
export default function NotFoundTracker() {
  useEffect(() => {
    trackPageNotFound(window.location.pathname);
  }, []);

  return null;
}
