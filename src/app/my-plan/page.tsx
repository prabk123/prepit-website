import type { Metadata } from "next";
import { headers } from "next/headers";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { COUNTRY_HEADER, webMarketFor } from "@/lib/markets";
import { WEB_PRICES } from "@/lib/pricing";
import { webBillingSellerFor } from "@/lib/revenuecat/sellers";
import MyPlan from "./MyPlan";

export const metadata: Metadata = {
  title: "Your plan",
  description: "The plan from your PrepIt quiz.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  referrer: "no-referrer",
  itunes: null,
};

/** The page the email gate's "copy of your plan" email links to (PRE-327). */
export default async function MyPlanPage() {
  const country = (await headers()).get(COUNTRY_HEADER);
  const market = webMarketFor(country);
  return (
    <div className="ph-no-capture flex w-full justify-center bg-page px-4 pb-section pt-28 text-ink lg:pt-36">
      <HideSiteFinalCta />
      <MyPlan market={market} prices={WEB_PRICES[webBillingSellerFor(country)]} />
    </div>
  );
}
