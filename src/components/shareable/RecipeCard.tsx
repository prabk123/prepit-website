import Image from "next/image";
import type { Recipe } from "@/lib/types/meal-plan";
import PrepItIcon from "./PrepItIcon";

interface RecipeCardProps {
  recipe: Recipe;
  servings: number;
  onClick?: () => void;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Recipe photo, or the plate icon on a raised tile when the recipe has none. */
export function RecipeThumb({
  recipe,
  sizes,
  iconSize,
  priority,
}: {
  recipe: Recipe;
  sizes: string;
  iconSize: number;
  priority?: boolean;
}) {
  if (recipe.image) {
    return (
      <Image
        src={recipe.image}
        alt={recipe.title}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-raised">
      <PrepItIcon name="restaurant" size={iconSize} className="text-ink-faint" />
    </div>
  );
}

export default function RecipeCard({ recipe, servings, onClick }: RecipeCardProps) {
  const calories = Math.round((recipe.nutritional_information?.calories ?? 0) * servings);
  const totalTime = (recipe.prep_time ?? 0) + (recipe.cooking_time ?? 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl">
        <RecipeThumb recipe={recipe} sizes="72px" iconSize={26} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-body font-medium text-ink group-hover:text-ink-secondary">
          {recipe.title}
        </p>
        <div className="mt-1 flex items-center gap-4">
          {calories > 0 && (
            <span className="flex items-center gap-1 text-small font-medium text-accent-text">
              <PrepItIcon name="fire" size={14} />
              {calories.toLocaleString("en-GB")} cal
            </span>
          )}
          {totalTime > 0 && (
            <span className="flex items-center gap-1 text-small text-ink-muted">
              <PrepItIcon name="clockEmpty" size={14} />
              {formatTime(totalTime)}
            </span>
          )}
        </div>
      </div>

      <PrepItIcon name="chevronRight" size={18} className="shrink-0 text-ink-faint" />
    </button>
  );
}
