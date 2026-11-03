import Link from "next/link";
import StartTrialCta from "@/components/ui/StartTrialCta";
import CtaBand from "@/components/ui/CtaBand";

export const MEAL_PLANS_PAGE_HREF = "/features/meal-plans";

/** The closing band on a shared plan. */
export default function MakeYourOwnPlan() {
  return (
    <CtaBand
      id="make-your-own-plan"
      title="Make your own plan"
      line="Ask for a week of meals. Get a plan built for you."
      cta={
        <div className="flex flex-col items-start gap-6">
          <StartTrialCta placement="shared-meal-plan-end" />
          <Link
            href={MEAL_PLANS_PAGE_HREF}
            className="text-body font-medium text-ink-secondary underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink-muted"
          >
            See how PrepIt plans your meals
          </Link>
        </div>
      }
    />
  );
}
