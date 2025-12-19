import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how PrepIt collects, uses, and protects your personal information. Read our privacy policy to understand your data rights and our commitment to privacy.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PrivacyPolicyPage() {
  const { title, effectiveDate, content } = await loadMDX("privacy-policy.mdx");

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      currentPath="/privacy-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
