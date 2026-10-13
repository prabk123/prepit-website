"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { SharedMealPlan, PlanDay, MealSelection, UnitSystem } from "@/lib/types/meal-plan";
import { planDayKey, planWeek } from "@/lib/plan-dates";
import { SHARED_MEAL_PLAN_EVENTS, trackSharedMealPlanEvent } from "@/lib/posthogAnalytics";
import WeekCalendar from "./WeekCalendar";
import CalorieSummary from "./CalorieSummary";
import RecipeCard from "./RecipeCard";
import GroceryListSection from "./GroceryListSection";
import RecipeDetailModal from "./RecipeDetailModal";
import UnitSystemToggle from "./UnitSystemToggle";

interface MealPlanViewProps {
  plan: SharedMealPlan;
}

/**
 * The interactive part of a shared plan: units, grocery list, the week strip
 * and one day of meals at a time (swipe or pick a day). On wide screens the
 * units and grocery list sit in a column beside the days.
 */
export default function MealPlanView({ plan }: MealPlanViewProps) {
  const [activeRecipe, setActiveRecipe] = useState<MealSelection | null>(null);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");

  const daysByDateKey = useMemo(() => {
    const map = new Map<string, number>();
    plan.days.forEach((day, i) => map.set(planDayKey(day.date), i));
    return map;
  }, [plan.days]);

  const planDateSet = useMemo(() => new Set(daysByDateKey.keys()), [daysByDateKey]);
  const weekDates = useMemo(() => planWeek(plan.days), [plan.days]);

  const [selectedDateKey, setSelectedDateKey] = useState(() => planDayKey(plan.days[0].date));

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingProgrammatically = useRef(false);

  const openRecipe = useCallback(
    (selection: MealSelection, slot: string) => {
      setActiveRecipe(selection);
      trackSharedMealPlanEvent(SHARED_MEAL_PLAN_EVENTS.recipeOpened, {
        plan_id: plan._id,
        slot,
      });
    },
    [plan._id],
  );

  const scrollToDay = useCallback((index: number) => {
    const el = dayRefs.current[index];
    const container = scrollContainerRef.current;
    if (el && container) {
      isScrollingProgrammatically.current = true;
      container.scrollTo({ left: el.offsetLeft - container.offsetLeft, behavior: "smooth" });
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
    [daysByDateKey, scrollToDay],
  );

  // Keep the week strip in step when the visitor swipes between days.
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
              setSelectedDateKey(planDayKey(plan.days[idx].date));
            }
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    for (const ref of dayRefs.current) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, [plan.days]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="rounded-tile border border-line bg-surface p-4 sm:p-5">
          <WeekCalendar
            weekDates={weekDates}
            planDateSet={planDateSet}
            selectedDate={selectedDateKey}
            onSelect={handleDaySelect}
          />
        </div>

        {/* One day per panel; swipe or use the week strip. */}
        <div
          ref={scrollContainerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Meals by day"
        >
          {plan.days.map((day, index) => (
            <div
              key={day.date}
              ref={(el) => {
                dayRefs.current[index] = el;
              }}
              className="w-full shrink-0 snap-center"
            >
              <DayContent day={day} onRecipeTap={openRecipe} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-28">
        <UnitSystemToggle value={unitSystem} onChange={setUnitSystem} />
        <GroceryListSection
          planId={plan._id}
          groceries={plan.groceries}
          days={plan.days}
          unitSystem={unitSystem}
        />
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
  onRecipeTap: (selection: MealSelection, slot: string) => void;
}) {
  const meals = [
    { slot: "breakfast", label: "Breakfast", selection: day.breakfast },
    { slot: "lunch", label: "Lunch", selection: day.lunch },
    { slot: "dinner", label: "Dinner", selection: day.dinner },
    { slot: "snack", label: "Snacks", selection: day.snack },
  ].filter(
    (m): m is { slot: string; label: string; selection: MealSelection } => m.selection != null,
  );

  return (
    <div className="rounded-tile border border-line bg-surface p-4 sm:p-5">
      <CalorieSummary day={day} />

      <div className="mt-5 flex flex-col gap-5">
        {meals.map(({ slot, label, selection }) => (
          <div key={slot}>
            <p className="mb-3 text-eyebrow font-medium uppercase text-ink-muted">{label}</p>
            <RecipeCard
              recipe={selection.recipe}
              servings={selection.servings}
              onClick={() => onRecipeTap(selection, slot)}
            />
          </div>
        ))}

        {meals.length === 0 && (
          <p className="py-8 text-center text-small text-ink-faint">No meals planned for this day</p>
        )}
      </div>
    </div>
  );
}
