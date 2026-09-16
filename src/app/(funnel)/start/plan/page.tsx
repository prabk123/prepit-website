import type { Metadata } from "next";
import PaywallPage from "@/features/onboarding/PaywallPage";

export const metadata: Metadata = {
  title: "Choose your plan",
  robots: { index: false, follow: false },
};

export default function StartPlanPage() {
  return <PaywallPage />;
}
