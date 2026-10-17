"use client";

import Link from "next/link";
import AppStoreButton from "@/components/ui/AppStoreButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { TRIAL_NOTE } from "@/lib/pricing";

/** The plan could not be loaded (the server logs the failure with the plan id). */
export default function MealPlanError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-10 rounded-card border border-line bg-surface px-5 py-14 sm:px-10 lg:px-16">
      <SectionHeading
        eyebrow="Shared meal plan"
        title="We couldn't load this meal plan"
        lead="Something went wrong on our side. Try again in a moment, or make your own plan with PrepIt."
        size="title"
        as="h1"
      />
      <div className="flex flex-col items-start gap-6">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-14 w-fit items-center rounded-control border border-line-strong px-7 text-body font-medium text-ink transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          Try again
        </button>
        <AppStoreButton trackingSource="shared-meal-plan-error" note={TRIAL_NOTE} />
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
