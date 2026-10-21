import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "How to get a refund for PrepIt: through Apple for App Store purchases, or from us for subscriptions bought on our website.",
  alternates: {
    canonical: "https://www.tryprepit.app/refund-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  // No Smart App Banner on legal pages.
  itunes: null,
};

export default async function RefundPolicyPage() {
  const { title, effectiveDate, content, headings } = await loadMDX("refund-policy.mdx");

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      headings={headings}
      currentPath="/refund-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
