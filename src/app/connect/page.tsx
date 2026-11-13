import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import ConnectConsent from "./ConnectConsent";

export const metadata: Metadata = {
  title: "Connect PrepIt",
  description: "Let an AI app read your PrepIt data.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  // The query carries the connection request's id; it must not leak to other sites.
  referrer: "no-referrer",
  itunes: null,
};

/**
 * Where an AI app (Claude at launch) sends people to connect PrepIt
 * (PRE-507): `?interaction=<id>` from the connector's OAuth server
 * (fresca_backend PRE-504). Sign in, then Allow or Cancel.
 */
export default function ConnectPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <ConnectConsent />
    </NarrowCard>
  );
}
