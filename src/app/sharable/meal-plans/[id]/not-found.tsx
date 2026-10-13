import Link from "next/link";
import AppStoreCta from "@/components/ui/AppStoreCta";
import SectionHeading from "@/components/ui/SectionHeading";

/** A shared link whose plan was deleted, or a mistyped id. */
export default function MealPlanNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-10 rounded-card border border-line bg-surface px-5 py-14 sm:px-10 lg:px-16">
      <SectionHeading
        eyebrow="Shared meal plan"
        title="This meal plan isn't available"
        lead="The link may be mistyped, or the plan may have been deleted. Ask whoever sent it to share it again, or make your own with PrepIt."
        size="title"
        as="h1"
      />
      <div className="flex flex-col items-start gap-6">
        <AppStoreCta trackingSource="shared-meal-plan-not-found" note="3 days free" />
        <Link
          href="/"
          className="text-body font-medium text-ink-secondary underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink-muted"
        >
          Go to the PrepIt home page
        </Link>
      </div>
    </div>
  );
}
