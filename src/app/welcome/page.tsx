import type { Metadata } from "next";
import { Suspense } from "react";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import AppStoreCta from "@/components/ui/AppStoreCta";
import NarrowCard from "@/components/ui/NarrowCard";
import WelcomeDetails from "./WelcomeDetails";

export const metadata: Metadata = {
  title: "You're in",
  description: "Download PrepIt and sign in to start.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * After a web purchase (PRE-269, PRE-270): get the app and sign in with the
 * same Google or Apple account. The QR code is for people who bought on a
 * laptop.
 */
export default function WelcomePage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <Suspense fallback={null}>
        <WelcomeDetails />
      </Suspense>
      <AppStoreCta
        trackingSource="web-handoff"
        qrCaption="Scan to get PrepIt on your iPhone"
        className="justify-center"
      />
    </NarrowCard>
  );
}
