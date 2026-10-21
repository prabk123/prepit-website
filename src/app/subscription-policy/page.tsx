import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Subscription Policy",
  description:
    "PrepIt's plans, prices and 7-day free trial, how renewal works, and how to cancel in the App Store or at tryprepit.app/account.",
  alternates: {
    canonical: "https://www.tryprepit.app/subscription-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  // No Smart App Banner on legal pages.
  itunes: null,
};

export default async function SubscriptionPolicyPage() {
  const { title, effectiveDate, content, headings } = await loadMDX(
    "subscription-policy.mdx"
  );

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      headings={headings}
      currentPath="/subscription-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
