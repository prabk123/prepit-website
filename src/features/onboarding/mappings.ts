export type GoalOption = {
  displayLabel: string;
  description: string;
  backendValue: string;
};

export const GOAL_OPTIONS: GoalOption[] = [
  {
    displayLabel: "Lose fat",
    description: "Reduce body fat while keeping muscle",
    backendValue: "lose weight",
  },
  {
    displayLabel: "Build muscle",
    description: "Gain strength and lean mass",
    backendValue: "gain muscle",
  },
  {
    displayLabel: "Improve energy",
    description: "Eat for steadier energy throughout the day",
    backendValue: "improve energy",
  },
  {
    displayLabel: "Stay fuller",
    description: "Understand what keeps you satisfied",
    backendValue: "stay fuller",
  },
  {
    displayLabel: "Eat healthier",
    description: "Build a better nutrition baseline",
    backendValue: "eat healthier",
  },
  {
    displayLabel: "Fuel training",
    description: "Fuel workouts and recovery",
    backendValue: "fuel training",
  },
  {
    displayLabel: "Maintain",
    description: "Keep your current weight and perform",
    backendValue: "maintain weight",
  },
];

export const GOALS_WITHOUT_WEIGHT_TARGET = new Set([
  "Maintain",
  "Improve energy",
  "Stay fuller",
  "Eat healthier",
]);

export function getGoalBackendValue(displayLabel: string): string {
  return (
    GOAL_OPTIONS.find((opt) => opt.displayLabel === displayLabel)?.backendValue ??
    GOAL_OPTIONS[0].backendValue
  );
}

export function getGoalDisplayLabel(backendValue: string): string | null {
  return (
    GOAL_OPTIONS.find((opt) => opt.backendValue === backendValue)?.displayLabel ??
    null
  );
}

export const BLOCKER_OPTIONS = [
  "Logging takes too long",
  "I get hungry",
  "I lose motivation",
  "I don't know what to eat",
  "I eat out or socialise a lot",
  "Weekends derail me",
  "I feel tired",
  "I crave snacks",
];

export const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Rather not say",
] as const;

export const DAILY_ACTIVITY_OPTIONS = [
  {
    label: "Mostly sitting",
    description: "Desk job, drive to work, little walking",
    backendValue: "mostly_sitting",
  },
  {
    label: "Lightly on feet",
    description: "Teacher, retail, regular walking",
    backendValue: "lightly_on_feet",
  },
  {
    label: "On feet most of the day",
    description: "Nurse, server, warehouse work",
    backendValue: "on_feet_most_of_day",
  },
  {
    label: "Physically demanding",
    description: "Construction, farming, heavy labour",
    backendValue: "physically_demanding",
  },
] as const;

export const EXERCISE_OPTIONS = [
  {
    label: "No exercise",
    description: "No structured workouts",
    backendValue: "none",
  },
  {
    label: "Light exercise",
    description: "1-2 days per week",
    backendValue: "one_to_two",
  },
  {
    label: "Moderate exercise",
    description: "3-5 days per week",
    backendValue: "three_to_five",
  },
  {
    label: "Heavy exercise",
    description: "6-7 days per week",
    backendValue: "six_to_seven",
  },
  {
    label: "Athlete",
    description: "Training twice per day",
    backendValue: "athlete",
  },
] as const;

export const DIET_OPTIONS = [
  "Eat everything",
  "Vegetarian",
  "Vegan",
  "Pescetarian",
  "High Protein",
  "Low Carb",
  "Keto",
];

export const INTOLERANCE_OPTIONS = [
  "Dairy",
  "Egg",
  "Gluten",
  "Soy",
  "Peanut",
  "Tree Nuts",
  "Sesame",
  "Fish",
  "Shellfish",
  "Crustacean",
  "Mollusc",
  "Pork",
  "Beef",
  "Alcohol",
  "Corn",
  "Sulfites",
  "Mustard",
  "Celery",
  "Lupin",
];

export function recommendedGoalSpeed(weightKg: number, goalWeightKg: number): number {
  const delta = goalWeightKg - weightKg;
  if (delta === 0) return 0;
  if (delta > 0) return 0.25;
  const raw = weightKg * 0.006;
  const rounded = Math.round(raw / 0.05) * 0.05;
  return Math.min(1, Math.max(0.25, Number(rounded.toFixed(2))));
}

export const CM_PER_INCH = 2.54;
export const LB_PER_KG = 2.20462;

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * CM_PER_INCH);
}

export function kgToLb(kg: number): number {
  return Math.round(kg * LB_PER_KG);
}

export function lbToKg(lb: number): number {
  return Math.round(lb / LB_PER_KG);
}

export function defaultUnitFromLocale(): "Metric" | "Imperial" {
  if (typeof navigator === "undefined") return "Metric";
  const locale = navigator.language || "";
  return locale.toLowerCase().includes("-us") ? "Imperial" : "Metric";
}
