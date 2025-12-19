import type { Metadata } from "next";
import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Learn about PrepIt's refund policy for in-app purchases and subscriptions. Understand your rights and how to request a refund if needed.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RefundPolicyPage() {
  const { title, effectiveDate, content } = await loadMDX("refund-policy.mdx");

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      currentPath="/refund-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
