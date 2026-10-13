"use client";

import { useEffect } from "react";
import { SHARED_MEAL_PLAN_EVENTS, trackSharedMealPlanEvent } from "@/lib/posthogAnalytics";

/** Sends `shared_meal_plan_viewed` once per page load: plan id and size only. */
export default function SharedPlanViewTracker({
  planId,
  dayCount,
  recipeCount,
  hasGroceries,
}: {
  planId: string;
  dayCount: number;
  recipeCount: number;
  hasGroceries: boolean;
}) {
  useEffect(() => {
    trackSharedMealPlanEvent(SHARED_MEAL_PLAN_EVENTS.viewed, {
      plan_id: planId,
      day_count: dayCount,
      recipe_count: recipeCount,
      has_groceries: hasGroceries,
    });
  }, [planId, dayCount, recipeCount, hasGroceries]);

  return null;
}
