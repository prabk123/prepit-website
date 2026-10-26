import type { Metadata } from "next";
import { Suspense } from "react";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import SignInBridge from "./SignInBridge";

export const metadata: Metadata = {
  title: "Create your PrepIt login",
  description: "Sign in with Google or Apple to get PrepIt.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * The sign-in bridge between Buy and payment (PRE-264, PRE-302): people sign
 * in with the Google or Apple account they'll use in the app, so the purchase
 * belongs to that PrepIt account.
 */
export default function SignInPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <Suspense fallback={<p className="text-body text-ink-secondary">Loading…</p>}>
        <SignInBridge />
      </Suspense>
    </NarrowCard>
  );
}
