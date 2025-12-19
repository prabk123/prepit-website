import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read PrepIt's terms and conditions. Understand the rules and guidelines for using our AI-powered meal planning and nutrition tracking app.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TermsAndConditionsPage() {
  const { title, effectiveDate, content } = await loadMDX(
    "terms-and-conditions.mdx"
  );

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      currentPath="/terms-and-conditions"
    >
      {content}
    </LegalMDXPage>
  );
}
