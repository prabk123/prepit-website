"use client";

import Link from "next/link";
import StartTrialCta from "@/components/ui/StartTrialCta";
import SectionHeading from "@/components/ui/SectionHeading";
import { PILL_CLASS } from "@/components/ui/pill";

/**
 * The plan could not be loaded (the server logs the failure with the plan id).
 * Laid out like the site's 404 and the plan's not-found page.
 */
export default function MealPlanError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col gap-10">
      <SectionHeading
        eyebrow="Shared meal plan"
        title="We couldn't load this meal plan."
        lead="Something went wrong on our side. Try again in a moment, or make your own plan with PrepIt."
        size="section"
        as="h1"
      />
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={PILL_CLASS}>
          Try again
        </button>
        <Link href="/" className={PILL_CLASS}>
          Go to the homepage
        </Link>
      </div>
      <StartTrialCta placement="shared-meal-plan-error" />
    </div>
  );
}
