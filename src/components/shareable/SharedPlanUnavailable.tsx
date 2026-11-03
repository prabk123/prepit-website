import Link from "next/link";
import StartTrialCta from "@/components/ui/StartTrialCta";
import SectionHeading from "@/components/ui/SectionHeading";
import { PILL_CLASS } from "@/components/ui/pill";

/**
 * A shared plan link that doesn't open. Laid out like the site's 404:
 * heading, pill link, then the button into web checkout.
 */
export default function SharedPlanUnavailable({ lead }: { lead: string }) {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeading
        eyebrow="Shared meal plan"
        title="This meal plan isn't available."
        lead={lead}
        size="section"
        as="h1"
      />
      <nav aria-label="Pages to try" className="flex flex-wrap gap-3">
        <Link href="/" className={PILL_CLASS}>
          Go to the homepage
        </Link>
      </nav>
      <StartTrialCta placement="shared-meal-plan-not-found" />
    </div>
  );
}
