"use client";

import { useEffect, useState } from "react";
import { visitorCountry } from "@/lib/landingAnalytics";
import { WEB_PRICES } from "@/lib/pricing";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";

/**
 * " £0 today." or " $0 today." after the trial line on static pages (the
 * guides, PRE-457), in the currency the visitor's checkout charges. The
 * country comes from the cookie the proxy sets, so nothing renders until it
 * has been read, rather than flashing the wrong currency.
 */
export default function FreeToday() {
  const [free, setFree] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the cookie is only readable in the browser
    setFree(WEB_PRICES[webBillingSellerFor(visitorCountry())].free);
  }, []);

  if (free === null) return null;
  return <> {free} today.</>;
}
