"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/funnel/attribution";

/** Keeps the campaign and referrer a visitor landed with, on whichever page they land (PRE-266, PRE-302). */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution(window.location, document.referrer);
  }, []);
  return null;
}
