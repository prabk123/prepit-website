import type { Metadata } from "next";
import { Suspense } from "react";
import { BridgeFooter, SUPPORT_EMAIL } from "@/components/bridge/BridgeParts";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { HideSiteChrome } from "@/components/SiteChrome";
import AppStoreCta from "@/components/ui/AppStoreCta";
import { openAppUrl } from "@/lib/appStore";
import OpenAppLink from "./OpenAppLink";
import WelcomeDetails from "./WelcomeDetails";

export const metadata: Metadata = {
  title: "You're in",
  description: "Download PrepIt and sign in to start.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * After a web purchase (PRE-269, PRE-270, PRE-325): get the app and sign in
 * with the same Google or Apple account. The QR code is for people who bought
 * on a laptop: it goes through /open, so a phone that already has PrepIt opens
 * it with their sign-in button first, and one without it gets the App Store.
 */
export default async function WelcomePage({ searchParams }: { searchParams: Promise<{ provider?: string | string[] }> }) {
  const { provider: raw } = await searchParams;
  const provider = raw === "google" || raw === "apple" ? raw : null;
  const download = (
    <div className="flex flex-col gap-3">
      <AppStoreCta
        trackingSource="web-handoff"
        qrCaption="Point your iPhone camera at the code"
        qrUrl={openAppUrl(provider)}
      />
      <OpenAppLink provider={provider} />
    </div>
  );
  return (
    <div className="flex w-full justify-center bg-page px-4 pb-section pt-4 text-ink lg:pt-8">
      <HideSiteChrome />
      <HideSiteFinalCta />
      <div className="flex w-full max-w-[560px] flex-col gap-6">
        <Suspense fallback={null}>
          <WelcomeDetails download={download} />
        </Suspense>
        <p className="text-small text-ink-muted">
          Can’t sign in? Email <span className="select-all font-bold text-ink">{SUPPORT_EMAIL}</span> from any address
          and we’ll find your account.
        </p>
        <BridgeFooter />
      </div>
    </div>
  );
}
