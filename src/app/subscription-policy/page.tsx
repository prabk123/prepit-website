import LegalMDXPage from "@/components/LegalMDXPage";
import { loadMDX } from "@/lib/loadMDX";

export default async function SubscriptionPolicyPage() {
  const { title, effectiveDate, content } = await loadMDX(
    "subscription-policy.mdx"
  );

  return (
    <LegalMDXPage
      title={title}
      lastUpdated={effectiveDate}
      currentPath="/subscription-policy"
    >
      {content}
    </LegalMDXPage>
  );
}
