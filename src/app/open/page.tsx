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

/**
 * `/open` links (PRE-270) open the PrepIt app on an iPhone that has it, through
 * Universal Links. Anyone who reaches this page doesn't have the app on this
 * device, or is on a computer, so it offers the App Store with a QR code.
 */
export default function OpenAppPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Get PrepIt on your iPhone"
        lead="PrepIt lives on your iPhone. Download it, then sign in with the same Google or Apple account you use with PrepIt."
      />
      <AppStoreCta trackingSource="web-open-link" qrCaption="Scan to get PrepIt on your iPhone" className="justify-center" />
    </NarrowCard>
  );
}
