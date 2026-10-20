import type { Metadata } from "next";
import { Suspense } from "react";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  title: "Choose your plan",
  description: "Start your PrepIt subscription.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/** Web checkout with RevenueCat Web Billing, for a signed-in visitor (PRE-269). */
export default function CheckoutPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <Suspense fallback={<p className="text-body text-ink-secondary">Loading…</p>}>
        <Checkout />
      </Suspense>
    </NarrowCard>
  );
}
