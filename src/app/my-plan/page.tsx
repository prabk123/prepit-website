import type { Metadata } from "next";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
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
export default function MyPlanPage() {
  return (
    <div className="flex w-full justify-center bg-page px-4 pb-section pt-28 text-ink lg:pt-36">
      <HideSiteFinalCta />
      <MyPlan />
    </div>
  );
}
