import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { TEXT_BUTTON_CLASS } from "@/components/ui/buttons";
import NarrowCard from "@/components/ui/NarrowCard";
import { AccountWithdrawalLink } from "@/components/withdrawal/WithdrawalLink";
import ManageSubscription from "./ManageSubscription";

export const metadata: Metadata = {
  title: "Manage your subscription",
  description: "Sign in to change or cancel a PrepIt subscription you bought on the website.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  itunes: null,
};

/**
 * Where web subscribers change or cancel (PRE-304): sign in, then RevenueCat's
 * Web Billing portal. Others are told where their subscription is managed.
 */
export default function AccountPage() {
  return (
    <NarrowCard>
      <HideSiteFinalCta />
      <ManageSubscription />
      <AccountWithdrawalLink className={TEXT_BUTTON_CLASS} />
    </NarrowCard>
  );
}
