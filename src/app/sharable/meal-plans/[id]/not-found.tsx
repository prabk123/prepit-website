import Link from "next/link";
import AppStoreCta from "@/components/ui/AppStoreCta";
import SectionHeading from "@/components/ui/SectionHeading";
import { PILL_CLASS } from "@/components/ui/pill";
import { TRIAL_NOTE } from "@/lib/pricing";

/**
 * A shared link whose plan was deleted, or a mistyped id. Laid out like the
 * site's 404: heading, pill link, then the App Store button.
 */
export default function MealPlanNotFound() {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeading
        eyebrow="Shared meal plan"
        title="This meal plan isn't available."
        lead="The link may be mistyped, or the plan may have been deleted. Ask whoever sent it to share it again, or make your own with PrepIt."
        size="section"
        as="h1"
      />
      <nav aria-label="Pages to try" className="flex flex-wrap gap-3">
        <Link href="/" className={PILL_CLASS}>
          Go to the homepage
        </Link>
      </nav>
      <AppStoreCta trackingSource="shared-meal-plan-not-found" note={TRIAL_NOTE} />
    </div>
  );
}
