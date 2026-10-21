import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What PrepIt collects (meals, photos, voice notes, chat, quiz answers), who processes it, how long we keep it and your rights.",
  alternates: {
    canonical: "https://www.tryprepit.app/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  // No Smart App Banner on legal pages.
  itunes: null,
};

export default async function PrivacyPolicyPage() {
  const { title, effectiveDate, content, headings } = await loadMDX("privacy-policy.mdx");

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      headings={headings}
      currentPath="/privacy-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
