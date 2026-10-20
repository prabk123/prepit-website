import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import AppStoreCta from "@/components/ui/AppStoreCta";
import NarrowCard from "@/components/ui/NarrowCard";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Open PrepIt",
  description: "Get PrepIt on your iPhone.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

const PROVIDER_NAMES = { google: "Google", apple: "Apple" } as const;

/**
 * `/open` links (PRE-270) open the PrepIt app on an iPhone that has it, through
 * Universal Links. Anyone who reaches this page doesn't have the app on this
 * device, or is on a computer, so it offers the App Store with a QR code.
 * `?provider=google|apple` (how they signed in on the web) names the button
 * to use in the app, and the app puts it first.
 */
export default async function OpenAppPage({ searchParams }: { searchParams: Promise<{ provider?: string | string[] }> }) {
  const { provider: raw } = await searchParams;
  const provider = raw === "google" || raw === "apple" ? raw : null;
  const signIn = provider
    ? `Download it, then tap Sign in and Continue with ${PROVIDER_NAMES[provider]}, with the same account you use with PrepIt.`
    : "Download it, then sign in with the same Google or Apple account you use with PrepIt.";
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Get PrepIt on your iPhone"
        lead={`PrepIt lives on your iPhone. ${signIn}`}
      />
      <AppStoreCta trackingSource="web-open-link" qrCaption="Scan to get PrepIt on your iPhone" className="justify-center" />
    </NarrowCard>
  );
}
