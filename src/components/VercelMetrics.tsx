"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { withoutUrlSecrets } from "@/lib/urlTokens";

/** Vercel Analytics and Speed Insights, with link credentials taken out of every URL they send. */
export default function VercelMetrics() {
  return (
    <>
      <SpeedInsights beforeSend={(event) => ({ ...event, url: withoutUrlSecrets(event.url) })} />
      <Analytics beforeSend={(event) => ({ ...event, url: withoutUrlSecrets(event.url) })} />
    </>
  );
}
