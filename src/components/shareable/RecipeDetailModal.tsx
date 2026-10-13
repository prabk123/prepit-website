"use client";

import { useState } from "react";
import type { Recipe, NutritionalInformation, UnitSystem } from "@/lib/types/meal-plan";
import { maybeConvert, formatCookQuantity } from "@/lib/unit-conversion";
import PrepItIcon from "./PrepItIcon";
import { RecipeThumb, formatTime } from "./RecipeCard";
import Sheet, { SheetCloseButton } from "./Sheet";

interface RecipeDetailModalProps {
  recipe: Recipe;
  servings: number;
  unitSystem: UnitSystem;
  onClose: () => void;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatQuantity(qty: number, ratio: number): string {
  const val = qty * ratio;
  if (Number.isInteger(val)) return String(val);
  return val.toFixed(1).replace(/\.0$/, "");
}

type TabId = "cooking" | "ingredients" | "nutrients";

const NUTRIENT_ROWS: { key: keyof NutritionalInformation; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "proteins", label: "Protein", unit: "g" },
  { key: "fats", label: "Fat", unit: "g" },
  { key: "saturated_fats", label: "Saturated Fat", unit: "g" },
  { key: "polyunsaturated_fats", label: "Polyunsaturated Fat", unit: "g" },
  { key: "monounsaturated_fats", label: "Monounsaturated Fat", unit: "g" },
  { key: "trans_fats", label: "Trans Fat", unit: "g" },
  { key: "cholesterol", label: "Cholesterol", unit: "mg" },
  { key: "sodium", label: "Sodium", unit: "mg" },
  { key: "sugar", label: "Sugar", unit: "g" },
  { key: "potassium", label: "Potassium", unit: "mg" },
  { key: "vitamin_a", label: "Vitamin A", unit: "mcg" },
  { key: "vitamin_c", label: "Vitamin C", unit: "mg" },
  { key: "calcium", label: "Calcium", unit: "mg" },
  { key: "iron", label: "Iron", unit: "mg" },
  { key: "fiber", label: "Fibre", unit: "g" },
];

export default function RecipeDetailModal({
  recipe,
  servings: initialServings,
  unitSystem,
  onClose,
}: RecipeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("cooking");
  const [currentServings, setCurrentServings] = useState(initialServings);

  const totalTime = (recipe.prep_time ?? 0) + (recipe.cooking_time ?? 0);
  const servingsRatio = currentServings / (recipe.servings || 1);
  const ni = recipe.nutritional_information;

  const tabs: { id: TabId; label: string }[] = [
    { id: "cooking", label: "Cooking" },
    { id: "ingredients", label: "Ingredients" },
    { id: "nutrients", label: "Nutrients" },
  ];

  return (
    <Sheet label={recipe.title} onClose={onClose}>
      {(close) => (
        <div className="flex-1 overflow-y-auto">
          <div className="relative h-[260px] w-full shrink-0 sm:h-[320px]">
            <RecipeThumb recipe={recipe} sizes="(max-width: 512px) 100vw, 512px" iconSize={56} priority />
            <SheetCloseButton onClick={close} className="absolute right-4 top-4 bg-overlay-strong backdrop-blur-sm" />
          </div>

          <div className="px-5 pb-8 pt-5">
            <h2 className="line-clamp-3 font-display text-title text-ink">{recipe.title}</h2>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-small text-ink-muted">
              {recipe.source && recipe.sourceType === "url" && (
                <span>from @{extractDomain(recipe.source)}</span>
              )}
              {totalTime > 0 && (
                <span className="flex items-center gap-1.5 text-ink-secondary">
                  <PrepItIcon name="clock" size={16} />
                  {formatTime(totalTime)}
                </span>
              )}
            </div>

            {ni && (
              <dl className="mt-5 grid grid-cols-4 gap-2">
                {[
                  { label: "Calories", value: Math.round((ni.calories ?? 0) * servingsRatio) },
                  { label: "Carbs", value: Math.round((ni.carbs ?? 0) * servingsRatio), suffix: "g" },
                  { label: "Protein", value: Math.round((ni.proteins ?? 0) * servingsRatio), suffix: "g" },
                  { label: "Fat", value: Math.round((ni.fats ?? 0) * servingsRatio), suffix: "g" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col-reverse items-center rounded-2xl bg-surface-raised py-3"
                  >
                    <dt className="text-small text-ink-muted">{stat.label}</dt>
                    <dd className="text-lead font-medium text-ink">
                      {stat.value}
                      {stat.suffix ?? ""}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-4 flex h-14 items-center rounded-2xl bg-surface-raised px-2">
              <button
                type="button"
                onClick={() => setCurrentServings((s) => Math.max(1, s - 1))}
                disabled={currentServings <= 1}
                aria-label="Decrease servings"
                className="flex h-10 w-10 items-center justify-center rounded-control text-ink transition-opacity hover:bg-line-strong disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <PrepItIcon name="minus" size={22} />
              </button>
              <span className="flex-1 text-center text-body text-ink" aria-live="polite">
                {currentServings} {currentServings === 1 ? "serving" : "servings"}
              </span>
              <button
                type="button"
                onClick={() => setCurrentServings((s) => s + 1)}
                aria-label="Increase servings"
                className="flex h-10 w-10 items-center justify-center rounded-control text-ink hover:bg-line-strong"
              >
                <PrepItIcon name="plus" size={22} />
              </button>
            </div>

            <div
              role="tablist"
              aria-label="Recipe details"
              className="mt-5 flex border-b border-line"
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const index = tabs.findIndex((t) => t.id === activeTab);
                const next = tabs[(index + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
                setActiveTab(next.id);
                document.getElementById(`recipe-tab-${next.id}`)?.focus();
              }}
            >
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`recipe-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="recipe-tabpanel"
                    tabIndex={active ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    className={`-mb-px flex-1 border-b-2 pb-3 text-center text-body transition-colors ${
                      active
                        ? "border-cream font-medium text-ink"
                        : "border-transparent text-ink-muted hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div
              id="recipe-tabpanel"
              role="tabpanel"
              aria-labelledby={`recipe-tab-${activeTab}`}
              className="mt-4"
            >
              {activeTab === "cooking" && (
                <CookingTab
                  instructions={recipe.instructions ?? []}
                  additionalNotes={recipe.additional_notes ?? []}
                />
              )}
              {activeTab === "ingredients" && (
                <IngredientsTab
                  ingredients={recipe.ingredients ?? []}
                  servingsRatio={servingsRatio}
                  unitSystem={unitSystem}
                />
              )}
              {activeTab === "nutrients" && <NutrientsTab ni={ni} servingsRatio={servingsRatio} />}
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function CookingTab({
  instructions,
  additionalNotes,
}: {
  instructions: string[];
  additionalNotes: string[];
}) {
  return (
    <div>
      {instructions.map((step, i) => (
        <div key={i} className="mb-6">
          <p className="font-display text-card-title text-ink">Step {i + 1}</p>
          <p className="mt-2 text-body text-ink-secondary">{step}</p>
        </div>
      ))}

      {additionalNotes.length > 0 && (
        <div className="mb-4">
          <p className="font-display text-card-title text-ink">Additional notes</p>
          <div className="mt-3 flex flex-col gap-3">
            {additionalNotes.map((note, i) => (
              <p key={i} className="text-body text-ink-secondary">
                {note}
              </p>
            ))}
          </div>
        </div>
      )}

      {instructions.length === 0 && additionalNotes.length === 0 && (
        <p className="py-8 text-center text-small text-ink-faint">
          No cooking instructions available
        </p>
      )}
    </div>
  );
}

function IngredientsTab({
  ingredients,
  servingsRatio,
  unitSystem,
}: {
  ingredients: Recipe["ingredients"];
  servingsRatio: number;
  unitSystem: UnitSystem;
}) {
  const preferMetric = unitSystem === "metric";

  return (
    <div>
      {ingredients.map((ing, i) => {
        const scaledQty = ing.quantity ? ing.quantity * servingsRatio : undefined;

        const converted = maybeConvert({
          quantity: scaledQty,
          unit: ing.unit,
          preferMetric,
          ingredientConversion: ing.ingredient_conversion,
        });

        let qtyStr = "";
        let unitLabel = "";

        if (converted) {
          qtyStr = formatCookQuantity(converted.quantity);
          unitLabel =
            converted.quantity === 1
              ? converted.unitLabelSingular
              : converted.unitLabelPlural;
        } else if (scaledQty) {
          qtyStr = formatQuantity(ing.quantity!, servingsRatio);
        }

        return (
          <div key={i} className="flex items-center gap-4 py-2">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-raised text-lead"
            >
              {ing.emoji || "🍽️"}
            </span>
            <span className="flex-1 text-body text-ink">
              {qtyStr}
              {unitLabel ? ` ${unitLabel}` : ""} {ing.ingredient}
              {ing.trailing_text ? ` ${ing.trailing_text}` : ""}
            </span>
          </div>
        );
      })}

      {ingredients.length === 0 && (
        <p className="py-8 text-center text-small text-ink-faint">
          No ingredients listed
        </p>
      )}
    </div>
  );
}

function NutrientsTab({
  ni,
  servingsRatio,
}: {
  ni: NutritionalInformation | undefined;
  servingsRatio: number;
}) {
  if (!ni) {
    return (
      <p className="py-8 text-center text-small text-ink-faint">
        No nutritional data available
      </p>
    );
  }

  const rows = NUTRIENT_ROWS.filter((r) => {
    const val = ni[r.key];
    return val !== undefined && val !== null && val !== 0;
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="flex bg-surface-raised px-4 py-3">
        <span className="flex-[2] text-small font-medium text-ink">Nutrient</span>
        <span className="flex-1 text-right text-small font-medium text-ink">Amount</span>
      </div>
      {rows.map((row) => {
        const rawVal = ni[row.key] ?? 0;
        const val = Math.round(rawVal * servingsRatio);
        return (
          <div key={row.key} className="flex border-t border-line px-4 py-3">
            <span className="flex-[2] text-small text-ink-secondary">{row.label}</span>
            <span className="flex-1 text-right text-small text-ink">
              {val}
              {row.unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}
