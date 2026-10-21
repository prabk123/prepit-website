import type { Metadata } from "next";
import { Suspense } from "react";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import StartBridge from "./StartBridge";

export const metadata: Metadata = {
  title: "Start your free week",
  description: "Sign in with Google or Apple, choose your plan, then get PrepIt on your iPhone.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * The shared bridge (PRE-323): the landing page and the quiz both send people
 * here (`/start?from=landing|quiz&plan=&funnel=`, see lib/funnel/bridgeHandoff.ts).
 * Sign in, then RevenueCat's paywall, then the "You're in" page.
 */
export default function StartPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <Suspense fallback={<p className="text-body text-ink-secondary">Loading…</p>}>
        <StartBridge />
      </Suspense>
    </NarrowCard>
  );
}
