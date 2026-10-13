"use client";

import { useState, useMemo } from "react";
import type { Grocery, PlanDay, UnitSystem } from "@/lib/types/meal-plan";
import { maybeConvert, formatCookQuantity } from "@/lib/unit-conversion";
import { SHARED_MEAL_PLAN_EVENTS, trackSharedMealPlanEvent } from "@/lib/posthogAnalytics";
import PrepItIcon from "./PrepItIcon";
import Sheet, { SheetCloseButton } from "./Sheet";

interface GroceryListSectionProps {
  planId: string;
  groceries: Grocery[];
  days: PlanDay[];
  unitSystem: UnitSystem;
}

function getTopEmojis(groceries: Grocery[], max = 3): string[] {
  const emojis: string[] = [];
  for (const g of groceries) {
    if (g.emoji && emojis.length < max && !emojis.includes(g.emoji)) {
      emojis.push(g.emoji);
    }
  }
  return emojis;
}

function buildQuantityText(item: Grocery, unitSystem: UnitSystem): string {
  if (!item.quantity) return "";

  if (!item.unit) {
    return String(Math.ceil(item.quantity));
  }

  const preferMetric = unitSystem === "metric";
  const converted = maybeConvert({
    quantity: item.quantity,
    unit: item.unit,
    preferMetric,
    ingredientConversion: item.ingredient_conversion,
  });

  if (!converted) return "";

  const qtyStr = formatCookQuantity(converted.quantity);
  const unitLabel =
    converted.quantity === 1
      ? converted.unitLabelSingular
      : converted.unitLabelPlural;
  return `${qtyStr}${preferMetric ? "" : " "}${unitLabel}`;
}

export default function GroceryListSection({
  planId,
  groceries,
  days,
  unitSystem,
}: GroceryListSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const topEmojis = useMemo(() => getTopEmojis(groceries), [groceries]);

  if (groceries.length === 0 && days.length > 0) {
    return (
      <div className="flex items-center gap-3 rounded-tile border border-line bg-surface p-4 sm:p-5">
        <PrepItIcon name="cart" size={24} className="text-ink" />
        <div className="flex-1">
          <p className="text-body font-medium text-ink">Grocery list</p>
          <p className="text-small text-ink-muted">Almost ready!</p>
        </div>
      </div>
    );
  }

  if (groceries.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setShowModal(true);
          trackSharedMealPlanEvent(SHARED_MEAL_PLAN_EVENTS.groceryListOpened, {
            plan_id: planId,
            item_count: groceries.length,
          });
        }}
        className="flex w-full items-center gap-3 rounded-tile border border-line bg-surface p-4 text-left transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:p-5"
      >
        <PrepItIcon name="cart" size={24} className="text-ink" />
        <div className="flex-1">
          <p className="text-body font-medium text-ink">Grocery list</p>
          <p className="text-small text-ink-muted">{groceries.length} ingredients</p>
        </div>

        {topEmojis.length > 0 && (
          <div className="flex -space-x-2" aria-hidden>
            {topEmojis.map((emoji, i) => (
              <div
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-control border-2 border-surface bg-surface-raised text-small"
                style={{ zIndex: topEmojis.length - i }}
              >
                {emoji}
              </div>
            ))}
          </div>
        )}

        <PrepItIcon name="chevronRight" size={18} className="text-ink-faint" />
      </button>

      {showModal && (
        <GroceryModal
          groceries={groceries}
          unitSystem={unitSystem}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function GroceryModal({
  groceries,
  unitSystem,
  onClose,
}: {
  groceries: Grocery[];
  unitSystem: UnitSystem;
  onClose: () => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, Grocery[]>();
    for (const g of groceries) {
      const cat = g.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(g);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [groceries]);

  return (
    <Sheet label="Grocery list" onClose={onClose}>
      {(close) => (
        <>
          <div className="flex shrink-0 items-center gap-3 px-5 pb-4 pt-6">
            <PrepItIcon name="cart" size={24} className="text-ink" />
            <div className="flex-1">
              <h2 className="font-display text-card-title text-ink">Grocery list</h2>
              <p className="text-small text-ink-muted">{groceries.length} ingredients</p>
            </div>
            <SheetCloseButton onClick={close} />
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-8">
            {grouped.map(([category, items]) => (
              <div key={category} className="mb-6 last:mb-0">
                <p className="mb-2 text-eyebrow font-medium uppercase text-ink-faint">{category}</p>
                <ul className="flex flex-col">
                  {items.map((item, idx) => {
                    const qtyText = buildQuantityText(item, unitSystem);
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-3 border-b border-line py-3 last:border-b-0"
                      >
                        <span
                          aria-hidden
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-raised text-lead"
                        >
                          {item.emoji || "•"}
                        </span>
                        <span className="flex-1 text-body text-ink">
                          {item.ingredient}
                          {item.trailing_text ? ` ${item.trailing_text}` : ""}
                        </span>
                        {qtyText && (
                          <span className="shrink-0 rounded-control bg-surface-raised px-3 py-1.5 text-small text-ink-secondary">
                            {qtyText}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
