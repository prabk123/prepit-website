import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import SectionHeading from "@/components/ui/SectionHeading";
import WaitlistForm from "./WaitlistForm";

export const metadata: Metadata = {
  title: "Join the PrepIt waitlist",
  description: "PrepIt isn't in your country yet. Leave your email and we'll tell you when it is.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/** For visitors in countries PrepIt doesn't sell in yet (PRE-331). */
export default function WaitlistPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <SectionHeading
        as="h1"
        size="title"
        align="center"
        title="PrepIt isn't in your country yet"
        lead="We're starting in a few countries first. Leave your email and we'll tell you when you can join."
      />
      <WaitlistForm />
    </NarrowCard>
  );
}
