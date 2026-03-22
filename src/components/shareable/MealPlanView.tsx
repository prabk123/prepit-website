"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { SharedMealPlan, PlanDay, MealSelection, UnitSystem } from "@/lib/types/meal-plan";
import WeekCalendar, { getWeekDates } from "./WeekCalendar";
import CalorieSummary from "./CalorieSummary";
import RecipeCard from "./RecipeCard";
import GroceryListSection from "./GroceryListSection";
import RecipeDetailModal from "./RecipeDetailModal";
import UnitSystemToggle from "./UnitSystemToggle";

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateRange(days: PlanDay[]): string {
  if (days.length === 0) return "";
  const start = new Date(days[0].date);
  const end = new Date(days[days.length - 1].date);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  return `${fmt(start)} - ${fmt(end)}`;
}

function countRecipes(days: PlanDay[]): number {
  const seen = new Set<string>();
  for (const day of days) {
    for (const meal of [day.breakfast, day.lunch, day.dinner, day.snack]) {
      if (meal?.recipe?._id) seen.add(meal.recipe._id);
    }
  }
  return seen.size;
}

interface MealPlanViewProps {
  plan: SharedMealPlan;
}

export default function MealPlanView({ plan }: MealPlanViewProps) {
  const [activeRecipe, setActiveRecipe] = useState<MealSelection | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");

  const daysByDateKey = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < plan.days.length; i++) {
      map.set(toDateKey(new Date(plan.days[i].date)), i);
    }
    return map;
  }, [plan.days]);

  const planDateSet = useMemo(
    () => new Set(daysByDateKey.keys()),
    [daysByDateKey]
  );

  const weekDates = useMemo(
    () => getWeekDates(new Date(plan.days[0].date)),
    [plan.days]
  );

  const firstDateKey = toDateKey(new Date(plan.days[0].date));
  const [selectedDateKey, setSelectedDateKey] = useState(firstDateKey);

  const selectedDayIndex = daysByDateKey.get(selectedDateKey) ?? 0;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingProgrammatically = useRef(false);

  const dateRange = formatDateRange(plan.days);
  const recipeCount = countRecipes(plan.days);

  const scrollToDay = useCallback((index: number) => {
    const el = dayRefs.current[index];
    const container = scrollContainerRef.current;
    if (el && container) {
      isScrollingProgrammatically.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 500);
    }
  }, []);

  const handleDaySelect = useCallback(
    (dateKey: string) => {
      setSelectedDateKey(dateKey);
      const idx = daysByDateKey.get(dateKey);
      if (idx !== undefined) {
        scrollToDay(idx);
      }
    },
    [daysByDateKey, scrollToDay]
  );

  // Snap scroll observer - sync calendar when user swipes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = dayRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              const dateKey = toDateKey(new Date(plan.days[idx].date));
              setSelectedDateKey(dateKey);
            }
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    for (const ref of dayRefs.current) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, [plan.days]);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="px-0">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          {dateRange}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#7A7A82" }}>
          {recipeCount} recipes
        </p>
      </div>

      {/* Unit toggle */}
      <UnitSystemToggle value={unitSystem} onChange={setUnitSystem} />

      {/* Grocery list */}
      <GroceryListSection groceries={plan.groceries} days={plan.days} unitSystem={unitSystem} />

      {/* Week calendar */}
      <div className="rounded-2xl bg-white p-4">
        <WeekCalendar
          weekDates={weekDates}
          planDateSet={planDateSet}
          selectedDate={selectedDateKey}
          onSelect={handleDaySelect}
        />
      </div>

      {/* Day content - horizontally scrollable */}
      <div
        ref={scrollContainerRef}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {plan.days.map((day, index) => (
          <div
            key={day.date}
            ref={(el) => {
              dayRefs.current[index] = el;
            }}
            className="w-full shrink-0 snap-center"
          >
            <DayContent day={day} onRecipeTap={setActiveRecipe} />
          </div>
        ))}
      </div>

      {activeRecipe && (
        <RecipeDetailModal
          recipe={activeRecipe.recipe}
          servings={activeRecipe.servings}
          unitSystem={unitSystem}
          onClose={() => setActiveRecipe(null)}
        />
      )}
    </div>
  );
}

function DayContent({
  day,
  onRecipeTap,
}: {
  day: PlanDay;
  onRecipeTap: (selection: MealSelection) => void;
}) {
  const meals = [
    { label: "Breakfast", selection: day.breakfast },
    { label: "Lunch", selection: day.lunch },
    { label: "Dinner", selection: day.dinner },
    { label: "Snacks", selection: day.snack },
  ].filter((m) => m.selection !== null);

  return (
    <div className="rounded-2xl bg-white p-4">
      <CalorieSummary day={day} />

      <div className="mt-4 flex flex-col gap-4">
        {meals.map(({ label, selection }) => (
          <div key={label}>
            <p
              className="mb-3 text-sm font-bold"
              style={{ color: "#4D4D59" }}
            >
              {label}
            </p>
            <RecipeCard
              recipe={selection!.recipe}
              servings={selection!.servings}
              onClick={() => onRecipeTap(selection!)}
            />
          </div>
        ))}

        {meals.length === 0 && (
          <p className="py-8 text-center text-sm" style={{ color: "#A6A6AC" }}>
            No meals planned for this day
          </p>
        )}
      </div>
    </div>
  );
}
