import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "The cookies and browser storage the PrepIt website and app use, including PostHog and the Meta Pixel, and how to turn them off.",
  alternates: {
    canonical: "https://www.tryprepit.app/cookie-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
  // No Smart App Banner on legal pages.
  itunes: null,
};

export default async function CookiePolicyPage() {
  const { title, effectiveDate, content, headings } = await loadMDX("cookie-policy.mdx");

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      headings={headings}
      currentPath="/cookie-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
