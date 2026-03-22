import Image from "next/image";
import type { Recipe } from "@/lib/types/meal-plan";
import PrepItIcon from "./PrepItIcon";

interface RecipeCardProps {
  recipe: Recipe;
  servings: number;
  onClick?: () => void;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function RecipeCard({ recipe, servings, onClick }: RecipeCardProps) {
  const calories = Math.round(
    (recipe.nutritional_information?.calories ?? 0) * servings
  );
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cooking_time ?? 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 text-left"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="h-full w-full bg-[#E9E9EA]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium">{recipe.title}</p>
        <div className="mt-1 flex items-center gap-3">
          {calories > 0 && (
            <span className="flex items-center gap-1">
              <PrepItIcon name="fire" size={14} color="#FF644F" />
              <span
                className="text-xs font-bold"
                style={{ color: "#FF644F" }}
              >
                {calories.toLocaleString()} cal
              </span>
            </span>
          )}
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <PrepItIcon name="clockEmpty" size={14} color="#7A7A82" />
              <span
                className="text-xs font-medium"
                style={{ color: "#7A7A82" }}
              >
                {formatTime(totalTime)}
              </span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
