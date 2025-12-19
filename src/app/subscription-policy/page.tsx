import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Subscription Policy",
  description:
    "Learn about PrepIt's subscription plans, billing, renewals, and cancellation. Understand how our subscription service works and manage your account.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SubscriptionPolicyPage() {
  const { title, effectiveDate, content } = await loadMDX(
    "subscription-policy.mdx"
  );

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      currentPath="/subscription-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
