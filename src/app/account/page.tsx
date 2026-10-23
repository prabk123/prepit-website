import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import NarrowCard from "@/components/ui/NarrowCard";
import ManageSubscription from "./ManageSubscription";

export const metadata: Metadata = {
  title: "Manage your subscription",
  description: "Change or cancel a PrepIt subscription you bought on the website.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  // An email's link carries a token until the page removes it (PRE-353).
  referrer: "no-referrer",
  itunes: null,
};

/**
 * Where web subscribers change or cancel (PRE-304): sign in, then RevenueCat's
 * Web Billing portal. Others are told where their subscription is managed.
 * Emails link here with a signed `?token=` that opens the portal without a
 * sign-in (PRE-353); the bare URL keeps working with sign-in.
 */
export default function AccountPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <ManageSubscription />
    </NarrowCard>
  );
}
