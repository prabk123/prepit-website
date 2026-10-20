import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import SectionHeading from "@/components/ui/SectionHeading";
import OpenAppButton from "./OpenAppButton";

export const metadata: Metadata = {
  title: "Finish signing in",
  description: "Open PrepIt on your iPhone to finish signing in.",
  robots: { index: false, follow: false },
};

/**
 * Where a sign-in email link lands: one button that opens the app. The
 * layout's <main> wraps this, with no download section under it.
 */
export default function EmailLinkPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="Finish signing in on your iPhone"
        lead="Tap below to open PrepIt and finish signing in."
      />
      <OpenAppButton />
    </NarrowCard>
  );
}
