import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import Publisher from "./Publisher";

export const metadata: Metadata = {
  title: "PrepIt Publisher for TikTok",
  description: "Post PrepIt's approved reels to the PrepIt TikTok account.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * PrepIt Publisher: the PrepIt team signs in with TikTok and posts reels it has
 * approved to its own account (TikTok Content Posting API, Direct Post).
 */
export default function TikTokPublisherPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <Publisher />
    </NarrowCard>
  );
}
