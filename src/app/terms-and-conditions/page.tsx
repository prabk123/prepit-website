import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

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
