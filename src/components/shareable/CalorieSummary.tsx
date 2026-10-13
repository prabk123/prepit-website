import type { PlanDay } from "@/lib/types/meal-plan";
import { formatLongDay } from "@/lib/plan-dates";
import PrepItIcon from "./PrepItIcon";

interface CalorieSummaryProps {
  day: PlanDay;
}

function calculateDayCalories(day: PlanDay): number {
  let total = 0;
  for (const meal of [day.breakfast, day.lunch, day.dinner, day.snack]) {
    if (meal?.recipe?.nutritional_information?.calories) {
      total += meal.recipe.nutritional_information.calories * (meal.servings ?? 1);
    }
  }
  return Math.round(total);
}

/** The day's name and planned calories, at the top of each day panel. */
export default function CalorieSummary({ day }: CalorieSummaryProps) {
  const totalCalories = calculateDayCalories(day);

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-surface-raised p-4">
      <PrepItIcon name="fire" size={30} className="text-satiety" />
      <div className="flex-1">
        <p className="text-small text-ink-muted">{formatLongDay(day.date)}</p>
        <p className="mt-0.5 font-display text-card-title text-ink">
          {totalCalories.toLocaleString("en-GB")} cal
        </p>
      </div>
    </div>
  );
}
