import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import PrivacyChoices from "./PrivacyChoices";

export const metadata: Metadata = {
  title: "Your Privacy Choices",
  description: "Opt out of the PrepIt website sharing your data with Meta for advertising.",
  alternates: { canonical: "https://www.tryprepit.app/privacy-choices" },
  robots: { index: false, follow: true },
  itunes: null,
};

/**
 * "Your Privacy Choices" (PRE-539): the US "Do Not Sell or Share" opt-out
 * for this browser. Global Privacy Control does the same for US visitors
 * without a click.
 */
export default function PrivacyChoicesPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <PrivacyChoices />
    </NarrowCard>
  );
}
