import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms for using the PrepIt app, website, quiz and checkout: not medical advice, AI estimates, subscriptions and your content.",
  alternates: {
    canonical: "https://www.tryprepit.app/terms-and-conditions",
  },
  robots: {
    index: true,
    follow: true,
  },
  // No Smart App Banner on legal pages.
  itunes: null,
};

export default async function TermsAndConditionsPage() {
  const { title, effectiveDate, content, headings } = await loadMDX(
    "terms-and-conditions.mdx"
  );

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      headings={headings}
      currentPath="/terms-and-conditions"
    >
      {content}
    </LegalMDXPage>
  );
}
