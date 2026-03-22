import type { PlanDay } from "@/lib/types/meal-plan";
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

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export default function CalorieSummary({ day }: CalorieSummaryProps) {
  const totalCalories = calculateDayCalories(day);
  const dayLabel = formatDayLabel(day.date);

  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-4"
      style={{ backgroundColor: "#F4F4F5" }}
    >
      <PrepItIcon name="fire" size={32} color="#FF644F" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "#7A7A82" }}>
            {dayLabel}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-base font-bold">
            {totalCalories.toLocaleString()} cal
          </span>
        </div>
      </div>
    </div>
  );
}
