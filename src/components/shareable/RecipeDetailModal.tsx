"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Recipe, NutritionalInformation, UnitSystem } from "@/lib/types/meal-plan";
import { maybeConvert, formatCookQuantity } from "@/lib/unit-conversion";
import PrepItIcon from "./PrepItIcon";

interface RecipeDetailModalProps {
  recipe: Recipe;
  servings: number;
  unitSystem: UnitSystem;
  onClose: () => void;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
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
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("cooking");
  const [currentServings, setCurrentServings] = useState(initialServings);

  const totalTime = (recipe.prep_time ?? 0) + (recipe.cooking_time ?? 0);
  const servingsRatio = currentServings / (recipe.servings || 1);
  const ni = recipe.nutritional_information;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "cooking", label: "Cooking" },
    { id: "ingredients", label: "Ingredients" },
    { id: "nutrients", label: "Nutrients" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: visible ? 0.5 : 0 }}
      />

      {/* Modal */}
      <div
        className="relative flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white transition-transform duration-300 ease-out"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-[280px] w-full shrink-0 sm:h-[360px]">
          {recipe.image ? (
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
              priority
            />
          ) : (
            <div className="h-full w-full bg-[#E9E9EA]" />
          )}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
          >
            <PrepItIcon name="close" size={18} color="#000" />
          </button>
        </div>

        {/* Title block overlapping image */}
        <div className="-mt-6 relative rounded-t-3xl bg-white px-4 pb-4 pt-6">
          <h2
            className="line-clamp-2 text-xl font-bold"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            {recipe.title}
          </h2>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {/* Source & time row */}
          <div className="flex items-center gap-4">
            {recipe.source && recipe.sourceType === "url" && (
              <span className="text-sm" style={{ color: "#7A7A82" }}>
                from @{extractDomain(recipe.source)}
              </span>
            )}
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <PrepItIcon name="clock" size={18} color="#000" />
                <span className="text-sm font-medium">
                  {formatTime(totalTime)}
                </span>
              </span>
            )}
          </div>

          {/* Nutrition stats */}
          {ni && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { label: "Calories", value: Math.round((ni.calories ?? 0) * servingsRatio) },
                { label: "Carbs", value: Math.round((ni.carbs ?? 0) * servingsRatio), suffix: "g" },
                { label: "Protein", value: Math.round((ni.proteins ?? 0) * servingsRatio), suffix: "g" },
                { label: "Fat", value: Math.round((ni.fats ?? 0) * servingsRatio), suffix: "g" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-2xl py-3"
                  style={{ backgroundColor: "#F4F4F5" }}
                >
                  <span className="text-lg font-bold">
                    {stat.value}
                    {stat.suffix ?? ""}
                  </span>
                  <span className="text-xs" style={{ color: "#000" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Servings selector */}
          <div
            className="mt-4 flex h-14 items-center rounded-2xl px-2"
            style={{ backgroundColor: "#F4F4F5" }}
          >
            <button
              onClick={() => setCurrentServings((s) => Math.max(1, s - 1))}
              disabled={currentServings <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-opacity disabled:opacity-30"
            >
              <PrepItIcon name="minus" size={24} color="#000" />
            </button>
            <span className="flex-1 text-center text-base">
              {currentServings} {currentServings === 1 ? "serving" : "servings"}
            </span>
            <button
              onClick={() => setCurrentServings((s) => s + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl"
            >
              <PrepItIcon name="plus" size={24} color="#000" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="mt-4 flex border-b border-[#E9E9EA]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 pb-3 text-center text-sm transition-colors"
                style={{
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  color: activeTab === tab.id ? "#000" : "#7A7A82",
                  borderBottom:
                    activeTab === tab.id ? "2px solid #000" : "2px solid transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-3">
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
            {activeTab === "nutrients" && (
              <NutrientsTab ni={ni} servingsRatio={servingsRatio} />
            )}
          </div>
        </div>
      </div>
    </div>
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
        <div key={i} className="mb-7">
          <p className="text-lg font-bold">Step {i + 1}</p>
          <p className="mt-2 text-sm leading-relaxed">{step}</p>
        </div>
      ))}

      {additionalNotes.length > 0 && (
        <div className="mb-4">
          <p className="text-lg font-bold">Additional Notes</p>
          <div className="mt-3 flex flex-col gap-3">
            {additionalNotes.map((note, i) => (
              <p key={i} className="text-sm leading-relaxed">
                {note}
              </p>
            ))}
          </div>
        </div>
      )}

      {instructions.length === 0 && additionalNotes.length === 0 && (
        <p className="py-8 text-center text-sm" style={{ color: "#A6A6AC" }}>
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
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: "#F4F4F5" }}
            >
              {ing.emoji || "🍽️"}
            </div>
            <span className="flex-1 text-base">
              {qtyStr}
              {unitLabel ? ` ${unitLabel}` : ""} {ing.ingredient}
              {ing.trailing_text ? ` ${ing.trailing_text}` : ""}
            </span>
          </div>
        );
      })}

      {ingredients.length === 0 && (
        <p className="py-8 text-center text-sm" style={{ color: "#A6A6AC" }}>
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
      <p className="py-8 text-center text-sm" style={{ color: "#A6A6AC" }}>
        No nutritional data available
      </p>
    );
  }

  const rows = NUTRIENT_ROWS.filter((r) => {
    const val = ni[r.key];
    return val !== undefined && val !== null && val !== 0;
  });

  return (
    <div className="overflow-hidden rounded-lg border border-[#D4D4D8]">
      <div
        className="flex px-4 py-3"
        style={{ backgroundColor: "#F4F4F5" }}
      >
        <span className="flex-[2] text-sm font-bold">Nutrient</span>
        <span className="flex-1 text-right text-sm font-bold">Amount</span>
      </div>
      {rows.map((row) => {
        const rawVal = ni[row.key] ?? 0;
        const val = Math.round(rawVal * servingsRatio);
        return (
          <div
            key={row.key}
            className="flex border-t border-[#D4D4D8] px-4 py-3"
          >
            <span className="flex-[2] text-sm">{row.label}</span>
            <span className="flex-1 text-right text-sm">
              {val}
              {row.unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}
