"use client";

import { useEffect } from "react";
import type { UnitSystem } from "@/lib/types/meal-plan";
import { SHARED_MEAL_PLAN_EVENTS, trackSharedMealPlanEvent } from "@/lib/posthogAnalytics";

/** Sends `shared_meal_plan_viewed` once per page load: plan id, size and default units only. */
export default function SharedPlanViewTracker({
  planId,
  dayCount,
  recipeCount,
  hasGroceries,
  unitSystem,
}: {
  planId: string;
  dayCount: number;
  recipeCount: number;
  hasGroceries: boolean;
  unitSystem: UnitSystem;
}) {
  useEffect(() => {
    trackSharedMealPlanEvent(SHARED_MEAL_PLAN_EVENTS.viewed, {
      plan_id: planId,
      day_count: dayCount,
      recipe_count: recipeCount,
      has_groceries: hasGroceries,
      unit_system: unitSystem,
    });
  }, [planId, dayCount, recipeCount, hasGroceries, unitSystem]);

  return null;
}
