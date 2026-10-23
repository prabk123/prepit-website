import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { WAITLIST_REGION_NAMES } from "@/lib/markets";
import WaitlistForm from "./WaitlistForm";

export const metadata: Metadata = {
  title: "Join the PrepIt waitlist",
  description: "PrepIt isn't in your country yet. Leave your email and we'll tell you when it is.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * For visitors in countries PrepIt doesn't sell in yet (PRE-331), and in
 * regions the website can't sell to (`?region=CA-QC`, PRE-354).
 */
export default async function WaitlistPage({ searchParams }: { searchParams: Promise<{ region?: string | string[] }> }) {
  const { region } = await searchParams;
  const regionName = typeof region === "string" ? WAITLIST_REGION_NAMES[region.toUpperCase()] : undefined;
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title={regionName ? `PrepIt isn't available in ${regionName} yet` : "PrepIt isn't in your country yet"}
        lead={
          regionName
            ? `Sorry, we can't sell PrepIt on our website in ${regionName} yet. Leave your email and we'll tell you when you can join.`
            : "We're starting in a few countries first. Leave your email and we'll tell you when you can join."
        }
      />
      <WaitlistForm place={regionName} />
    </NarrowCard>
  );
}
