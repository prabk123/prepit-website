"use client";

import SectionHeading from "@/components/ui/SectionHeading";

/** The plan could not be loaded (the server logs the failure with the plan id). */
export default function MealPlanError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-10 rounded-card border border-line bg-surface px-5 py-14 sm:px-10 lg:px-16">
      <SectionHeading
        eyebrow="Shared meal plan"
        title="We couldn't load this meal plan"
        lead="Something went wrong on our side. Try again in a moment."
        size="title"
        as="h1"
      />
      <button
        type="button"
        onClick={reset}
        className="inline-flex h-14 w-fit items-center rounded-button bg-primary px-7 text-body font-bold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
      >
        Try again
      </button>
    </div>
  );
}
