import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

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
