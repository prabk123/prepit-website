"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Grocery, PlanDay, UnitSystem } from "@/lib/types/meal-plan";
import { formatPlanRange } from "@/lib/plan-dates";
import { maybeConvert, formatCookQuantity } from "@/lib/unit-conversion";
import { SHARED_MEAL_PLAN_EVENTS, trackSharedMealPlanEvent } from "@/lib/posthogAnalytics";
import PrepItIcon from "./PrepItIcon";
import Sheet, { SheetCloseButton } from "./Sheet";

interface GroceryListSectionProps {
  planId: string;
  groceries: Grocery[];
  days: PlanDay[];
  /** The app is still building the list, so an empty one is not final. */
  groceriesPending: boolean;
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

/** Items by category, categories A to Z, as the sheet and the copied text show them. */
function groupByCategory(groceries: Grocery[]): [string, Grocery[]][] {
  const map = new Map<string, Grocery[]>();
  for (const g of groceries) {
    const cat = g.category || "Other";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(g);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function itemName(item: Grocery): string {
  return item.trailing_text ? `${item.ingredient} ${item.trailing_text}` : item.ingredient;
}

/**
 * Plain text for the clipboard or the share sheet, laid out like the app's
 * own grocery list copy: dates, "Made with PrepIt", then items by category.
 */
export function groceryListText(groceries: Grocery[], days: PlanDay[], unitSystem: UnitSystem): string {
  const range = formatPlanRange(days);
  const sections = groupByCategory(groceries).map(([category, items]) => {
    const lines = items.map((item) => {
      const qty = buildQuantityText(item, unitSystem);
      return `  ${item.emoji ? `${item.emoji} ` : ""}${itemName(item)}${qty ? ` – ${qty}` : ""}`;
    });
    return [category, ...lines].join("\n");
  });
  return [range ? `Grocery List for ${range}` : "Grocery List", "Made with PrepIt", ...sections].join("\n\n");
}

export default function GroceryListSection({
  planId,
  groceries,
  days,
  groceriesPending,
  unitSystem,
}: GroceryListSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const topEmojis = useMemo(() => getTopEmojis(groceries), [groceries]);

  if (groceries.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-tile border border-line bg-surface p-4 sm:p-5">
        <PrepItIcon name="cart" size={24} className="text-ink" />
        <div className="flex-1">
          <p className="text-body font-medium text-ink">Grocery list</p>
          <p className="text-small text-ink-muted">
            {groceriesPending ? "Almost ready" : "No grocery list for this plan"}
          </p>
        </div>
      </div>
    );
  }

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
        className="flex w-full items-center gap-3 rounded-tile border border-line bg-surface p-4 text-left transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:p-5"
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
          planId={planId}
          groceries={groceries}
          days={days}
          unitSystem={unitSystem}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers, or a page not served over HTTPS.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

type CopyState = "idle" | "copied" | "failed";

const FOOTER_BUTTON =
  "flex h-12 flex-1 items-center justify-center gap-2 rounded-control bg-surface-raised px-4 text-body font-medium text-ink transition-colors hover:bg-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

function GroceryModal({
  planId,
  groceries,
  days,
  unitSystem,
  onClose,
}: {
  planId: string;
  groceries: Grocery[];
  days: PlanDay[];
  unitSystem: UnitSystem;
  onClose: () => void;
}) {
  const grouped = useMemo(() => groupByCategory(groceries), [groceries]);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  // The sheet only opens after a tap, so this never runs on the server. The
  // share sheet exists on phones (and Safari); the button shows only there.
  const [canShare] = useState(() => typeof navigator.share === "function");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const eventProperties = { plan_id: planId, item_count: groceries.length, unit_system: unitSystem };

  const copy = async () => {
    const ok = await writeToClipboard(groceryListText(groceries, days, unitSystem));
    setCopyState(ok ? "copied" : "failed");
    if (ok) trackSharedMealPlanEvent(SHARED_MEAL_PLAN_EVENTS.groceryListCopied, eventProperties);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2500);
  };

  const share = async () => {
    try {
      await navigator.share({ title: "Grocery list", text: groceryListText(groceries, days, unitSystem) });
      trackSharedMealPlanEvent(SHARED_MEAL_PLAN_EVENTS.groceryListShared, eventProperties);
    } catch {
      // Closing the share sheet rejects too; nothing to tell the visitor.
    }
  };

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
                        <span className="flex-1 text-body text-ink">{itemName(item)}</span>
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

          <div className="flex shrink-0 gap-3 border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <button type="button" onClick={copy} className={FOOTER_BUTTON}>
              <PrepItIcon name={copyState === "copied" ? "checkmark" : "paste"} size={18} />
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Couldn't copy" : "Copy"}
            </button>
            {canShare && (
              <button type="button" onClick={share} className={FOOTER_BUTTON}>
                <PrepItIcon name="share" size={18} />
                Share
              </button>
            )}
            <span role="status" aria-live="polite" className="sr-only">
              {copyState === "copied" ? "Grocery list copied" : copyState === "failed" ? "Couldn't copy the grocery list" : ""}
            </span>
          </div>
        </>
      )}
    </Sheet>
  );
}
