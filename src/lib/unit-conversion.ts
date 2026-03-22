import type { UnitInfo, UnitConversion } from "./types/meal-plan";

interface ConvertedQuantity {
  quantity: number;
  unitLabelSingular: string;
  unitLabelPlural: string;
}

function culinaryStep(unitLabel: string): number {
  const u = unitLabel.trim().toLowerCase();

  if (["tsp", "teaspoon", "teaspoons"].includes(u)) return 0.25;
  if (["tbsp", "tablespoon", "tablespoons"].includes(u)) return 0.5;
  if (["cup", "cups"].includes(u)) return 0.25;
  if (["ml", "milliliter", "millilitre", "milliliters", "millilitres"].includes(u)) return 5;
  if (["l", "liter", "litre", "liters", "litres"].includes(u)) return 0.1;
  if (["g", "gram", "grams"].includes(u)) return 5;
  if (["kg", "kilogram", "kilograms"].includes(u)) return 0.1;
  if (["oz", "ounce", "ounces"].includes(u)) return 0.25;
  if (["lb", "pound", "pounds"].includes(u)) return 0.25;

  return 0.01;
}

function roundToStep(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.round(value / step) * step;
}

export function formatCookQuantity(value: number): string {
  if (Math.abs(value) < 1e-9) return "0";
  const cleaned = Math.round(value * 1000000) / 1000000;
  if (Math.abs(cleaned - Math.round(cleaned)) < 1e-9) {
    return String(Math.round(cleaned));
  }
  return cleaned
    .toFixed(2)
    .replace(/\.?0+$/, "");
}

export function maybeConvert({
  quantity,
  unit,
  preferMetric,
  ingredientConversion,
}: {
  quantity?: number;
  unit?: UnitInfo;
  preferMetric: boolean;
  ingredientConversion?: UnitConversion;
}): ConvertedQuantity | null {
  if (!quantity || !unit) return null;
  if (quantity === 0) return null;

  const isMetric = unit.system === "metric";

  if (isMetric === preferMetric) {
    return {
      quantity,
      unitLabelSingular: unit.displayName ?? "",
      unitLabelPlural: unit.pluralDisplayName ?? unit.displayName ?? "",
    };
  }

  let converted: number;
  let unitSingular: string;
  let unitPlural: string;

  if (
    preferMetric &&
    !isMetric &&
    ingredientConversion?.unit === "gram" &&
    ingredientConversion.factor &&
    ingredientConversion.factor > 0
  ) {
    converted = quantity * ingredientConversion.factor;
    unitSingular = ingredientConversion.unit;
    unitPlural = ingredientConversion.pluralDisplayName || ingredientConversion.plural || unitSingular;
  } else if (
    !preferMetric &&
    isMetric &&
    ingredientConversion?.unit === "gram" &&
    ingredientConversion.factor &&
    ingredientConversion.factor > 0
  ) {
    converted = quantity / ingredientConversion.factor;
    unitSingular = unit.measurement ?? "";
    unitPlural = unit.pluralDisplayName || unit.plural || unitSingular;
  } else if (unit.conversion?.factor && unit.conversion.factor > 0) {
    converted = quantity * unit.conversion.factor;
    unitSingular = unit.conversion.unit ?? "";
    unitPlural = unit.conversion.pluralDisplayName || unit.conversion.plural || unitSingular;
  } else {
    return {
      quantity,
      unitLabelSingular: unit.displayName ?? "",
      unitLabelPlural: unit.pluralDisplayName ?? unit.displayName ?? "",
    };
  }

  const step = culinaryStep(unitSingular);
  const rounded = roundToStep(converted, step);
  const safe = Math.max(rounded, step);

  return {
    quantity: safe,
    unitLabelSingular: unitSingular,
    unitLabelPlural: unitPlural || unitSingular,
  };
}
