"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Grocery, PlanDay, UnitSystem } from "@/lib/types/meal-plan";
import { maybeConvert, formatCookQuantity } from "@/lib/unit-conversion";
import PrepItIcon from "./PrepItIcon";

interface GroceryListSectionProps {
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
  groceries,
  days,
  unitSystem,
}: GroceryListSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const topEmojis = useMemo(() => getTopEmojis(groceries), [groceries]);

  if (groceries.length === 0 && days.length > 0) {
    return (
      <div className="rounded-2xl bg-white p-4">
        <div className="flex items-center gap-3">
          <PrepItIcon name="cart" size={24} color="#000" />
          <div className="flex-1">
            <p className="text-base font-bold">Grocery list</p>
            <p className="text-sm" style={{ color: "#7A7A82" }}>
              Almost ready!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (groceries.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex w-full items-center gap-3 rounded-2xl bg-white p-4"
      >
        <PrepItIcon name="cart" size={24} color="#000" />
        <div className="flex-1 text-left">
          <p className="text-base font-bold">Grocery list</p>
          <p className="text-sm" style={{ color: "#7A7A82" }}>
            {groceries.length} Ingredients
          </p>
        </div>

        {topEmojis.length > 0 && (
          <div className="flex -space-x-2">
            {topEmojis.map((emoji, i) => (
              <div
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-sm"
                style={{ backgroundColor: "#F4F4F5", zIndex: topEmojis.length - i }}
              >
                {emoji}
              </div>
            ))}
          </div>
        )}

        <PrepItIcon name="chevronDown" size={20} color="#7A7A82" className="-rotate-90" />
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
  const [visible, setVisible] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, Grocery[]>();
    for (const g of groceries) {
      const cat = g.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(g);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [groceries]);

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={handleClose}
    >
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: visible ? 0.5 : 0 }}
      />

      <div
        className="relative flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white transition-transform duration-300 ease-out"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 px-4 pb-3 pt-6">
          <PrepItIcon name="cart" size={24} color="#000" />
          <div className="flex-1">
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-brand)" }}>
              Grocery list
            </h2>
            <p className="text-sm" style={{ color: "#7A7A82" }}>
              {groceries.length} Ingredients
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: "#F4F4F5" }}
          >
            <PrepItIcon name="close" size={18} color="#000" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {grouped.map(([category, items]) => (
            <div key={category} className="mb-6 last:mb-0">
              <p
                className="mb-3 text-xs font-bold uppercase tracking-wide"
                style={{ color: "#A6A6AC" }}
              >
                {category}
              </p>
              <div className="flex flex-col">
                {items.map((item, idx) => {
                  const qtyText = buildQuantityText(item, unitSystem);
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 border-b border-[#F4F4F5] py-3 last:border-b-0"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                        style={{ backgroundColor: "#F4F4F5" }}
                      >
                        {item.emoji || "•"}
                      </div>
                      <span className="flex-1 text-sm">
                        {item.ingredient}
                        {item.trailing_text ? ` ${item.trailing_text}` : ""}
                      </span>
                      {qtyText && (
                        <span
                          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium"
                          style={{ backgroundColor: "#F4F4F5", color: "#4D4D59" }}
                        >
                          {qtyText}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
