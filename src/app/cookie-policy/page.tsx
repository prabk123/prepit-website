import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn about how PrepIt uses cookies and similar technologies to improve your experience. Understand what data we collect and how you can manage your preferences.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CookiePolicyPage() {
  const { title, effectiveDate, content } = await loadMDX("cookie-policy.mdx");

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      currentPath="/cookie-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
