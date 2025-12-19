import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

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
