import Link from "next/link";
import AppStoreCta from "@/components/ui/AppStoreCta";
import CtaBand from "@/components/ui/CtaBand";
import { TRIAL_NOTE } from "@/lib/pricing";

// TODO(PRE-203): point at the meal plans feature page once it exists.
export const MEAL_PLANS_PAGE_HREF = "/#ai-coach";

/** The closing band on a shared plan. */
export default function MakeYourOwnPlan() {
  return (
    <CtaBand
      id="make-your-own-plan"
      title="Make your own plan"
      line="Ask for a week of meals. Get a plan built for you."
      cta={
        <div className="flex flex-col items-start gap-6">
          <AppStoreCta
            trackingSource="shared-meal-plan-end"
            note={TRIAL_NOTE}
            qrCaption="Scan with your iPhone camera"
          />
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
