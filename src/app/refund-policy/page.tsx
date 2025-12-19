import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

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
