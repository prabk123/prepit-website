import type { Grocery, MealSelection, PlanDay, Recipe, SharedMealPlan } from "./types/meal-plan";

/**
 * Made-up shared plans for local development and Vercel previews, so the page
 * can be checked without a database. Production never serves them.
 *
 * - `FULL`: five days from next Monday with groceries, stored as UTC midnight
 *   like current app builds. One recipe has a (placeholder) photo.
 * - `LEGACY`: three days stored as London local midnight (23:00 UTC the day
 *   before), with no groceries and an empty day, like plans shared from older
 *   app builds.
 * - `PENDING`: the `FULL` days, just saved, with the grocery list still being
 *   built.
 */
export const SHARED_PLAN_FIXTURE_IDS = {
  FULL: "0000000000000000000205a1",
  LEGACY: "0000000000000000000205a2",
  PENDING: "0000000000000000000205a3",
} as const;

export const sharedPlanFixturesEnabled =
  process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";

type RecipeSeed = Pick<Recipe, "title" | "description"> & {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  prep: number;
  cook: number;
  ingredients: Recipe["ingredients"];
  steps: string[];
  image?: string;
};

let recipeCount = 0;

function recipe(seed: RecipeSeed): Recipe {
  recipeCount += 1;
  return {
    _id: `fixture-recipe-${recipeCount}`,
    title: seed.title,
    description: seed.description,
    image: seed.image ?? "",
    servings: 1,
    prep_time: seed.prep,
    cooking_time: seed.cook,
    nutritional_information: {
      calories: seed.calories,
      proteins: seed.proteins,
      carbs: seed.carbs,
      fats: seed.fats,
      fiber: 6,
      sugar: 9,
      sodium: 420,
    },
    tags: [],
    instructions: seed.steps,
    ingredients: seed.ingredients,
    additional_notes: [],
  };
}

const grams = {
  measurement: "g",
  system: "metric",
  category: "mass",
  plural: "g",
  displayName: "g",
  pluralDisplayName: "g",
  canConvert: true,
  conversion: { unit: "oz", factor: 0.035274, plural: "oz", displayName: "oz", pluralDisplayName: "oz" },
};

const millilitres = {
  measurement: "ml",
  system: "metric",
  category: "volume",
  plural: "ml",
  displayName: "ml",
  pluralDisplayName: "ml",
  canConvert: true,
  conversion: { unit: "cup", factor: 0.00422675, plural: "cups", displayName: "cup", pluralDisplayName: "cups" },
};

const yogurt = recipe({
  title: "Greek yogurt with berries and granola",
  description: "Thick yogurt, mixed berries and a handful of granola.",
  // A drawn placeholder (not a real photo), so the photo paths on the page
  // and in the link preview are exercised. The other recipes have none.
  image: "/dev-preview/meal-photo-placeholder.jpg",
  calories: 380,
  proteins: 24,
  carbs: 42,
  fats: 12,
  prep: 5,
  cook: 0,
  ingredients: [
    { ingredient: "Greek yogurt", quantity: 200, unit: grams, emoji: "🥛" },
    { ingredient: "Mixed berries", quantity: 80, unit: grams, emoji: "🫐" },
    { ingredient: "Granola", quantity: 30, unit: grams, emoji: "🥣" },
  ],
  steps: ["Spoon the yogurt into a bowl.", "Top with the berries and granola."],
});

const porridge = recipe({
  title: "Porridge with banana",
  description: "Oats cooked in milk with sliced banana.",
  calories: 410,
  proteins: 15,
  carbs: 68,
  fats: 9,
  prep: 2,
  cook: 6,
  ingredients: [
    { ingredient: "Rolled oats", quantity: 50, unit: grams, emoji: "🌾" },
    { ingredient: "Semi-skimmed milk", quantity: 250, unit: millilitres, emoji: "🥛" },
    { ingredient: "Banana", quantity: 1, emoji: "🍌" },
  ],
  steps: ["Simmer the oats in the milk for 5 minutes, stirring.", "Top with sliced banana."],
});

const chickenRice = recipe({
  title: "Chicken, rice and broccoli",
  description: "Grilled chicken breast with jasmine rice and steamed broccoli.",
  calories: 560,
  proteins: 46,
  carbs: 58,
  fats: 13,
  prep: 10,
  cook: 20,
  ingredients: [
    { ingredient: "Chicken breast", quantity: 150, unit: grams, emoji: "🍗" },
    { ingredient: "Jasmine rice", quantity: 75, unit: grams, emoji: "🍚" },
    { ingredient: "Broccoli", quantity: 120, unit: grams, emoji: "🥦" },
  ],
  steps: [
    "Cook the rice.",
    "Grill the chicken for 6 to 7 minutes a side.",
    "Steam the broccoli for 4 minutes and serve together.",
  ],
});

const beefBowl = recipe({
  title: "Korean beef rice bowl",
  description: "Lean beef mince with kimchi, spinach and rice.",
  calories: 640,
  proteins: 42,
  carbs: 66,
  fats: 20,
  prep: 10,
  cook: 15,
  ingredients: [
    { ingredient: "Lean beef mince", quantity: 125, unit: grams, emoji: "🥩" },
    { ingredient: "Jasmine rice", quantity: 75, unit: grams, emoji: "🍚" },
    { ingredient: "Kimchi", quantity: 60, unit: grams, emoji: "🥬" },
    { ingredient: "Spinach", quantity: 50, unit: grams, emoji: "🥬" },
  ],
  steps: ["Cook the rice.", "Brown the mince with soy and garlic.", "Wilt the spinach and build the bowl."],
});

const salmon = recipe({
  title: "Salmon, new potatoes and green beans",
  description: "Roast salmon fillet with new potatoes and green beans.",
  calories: 590,
  proteins: 38,
  carbs: 44,
  fats: 26,
  prep: 10,
  cook: 25,
  ingredients: [
    { ingredient: "Salmon fillet", quantity: 130, unit: grams, emoji: "🐟" },
    { ingredient: "New potatoes", quantity: 200, unit: grams, emoji: "🥔" },
    { ingredient: "Green beans", quantity: 100, unit: grams, emoji: "🫛" },
  ],
  steps: ["Roast the potatoes for 25 minutes.", "Add the salmon for the last 12 minutes.", "Boil the beans for 4 minutes."],
});

const halloumiWrap = recipe({
  title: "Halloumi and pepper wrap",
  description: "Grilled halloumi, roasted pepper and salad in a wholemeal wrap.",
  calories: 520,
  proteins: 24,
  carbs: 46,
  fats: 26,
  prep: 10,
  cook: 8,
  ingredients: [
    { ingredient: "Halloumi", quantity: 60, unit: grams, emoji: "🧀" },
    { ingredient: "Roasted red pepper", quantity: 80, unit: grams, emoji: "🫑" },
    { ingredient: "Wholemeal wrap", quantity: 1, emoji: "🌯" },
  ],
  steps: ["Grill the halloumi slices for 2 minutes a side.", "Fill the wrap with pepper, salad and halloumi."],
});

const applePb = recipe({
  title: "Apple with peanut butter",
  description: "A sliced apple with a tablespoon of peanut butter.",
  calories: 190,
  proteins: 5,
  carbs: 25,
  fats: 8,
  prep: 3,
  cook: 0,
  ingredients: [
    { ingredient: "Apple", quantity: 1, emoji: "🍎" },
    { ingredient: "Peanut butter", quantity: 15, unit: grams, emoji: "🥜" },
  ],
  steps: ["Slice the apple and serve with the peanut butter."],
});

function meal(r: Recipe): MealSelection {
  return { recipe: r, servings: 1 };
}

function utcMidnight(daysFromStart: number, start: Date): string {
  return new Date(start.getTime() + daysFromStart * 86_400_000).toISOString();
}

/** Next Monday, as UTC midnight. */
function nextMonday(): Date {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const weekday = new Date(today).getUTCDay();
  const offset = ((8 - weekday) % 7) || 7;
  return new Date(today + offset * 86_400_000);
}

const groceries: Grocery[] = [
  { category: "Meat and fish", ingredient: "Chicken breast", quantity: 450, unit: grams, emoji: "🍗" },
  { category: "Meat and fish", ingredient: "Lean beef mince", quantity: 250, unit: grams, emoji: "🥩" },
  { category: "Meat and fish", ingredient: "Salmon fillet", quantity: 260, unit: grams, emoji: "🐟" },
  { category: "Dairy", ingredient: "Greek yogurt", quantity: 600, unit: grams, emoji: "🥛" },
  { category: "Dairy", ingredient: "Halloumi", quantity: 120, unit: grams, emoji: "🧀" },
  { category: "Dairy", ingredient: "Semi-skimmed milk", quantity: 500, unit: millilitres, emoji: "🥛" },
  { category: "Fruit and veg", ingredient: "Mixed berries", quantity: 240, unit: grams, emoji: "🫐" },
  { category: "Fruit and veg", ingredient: "Broccoli", quantity: 360, unit: grams, emoji: "🥦" },
  { category: "Fruit and veg", ingredient: "Bananas", quantity: 2, emoji: "🍌" },
  { category: "Fruit and veg", ingredient: "Apples", quantity: 3, emoji: "🍎" },
  { category: "Fruit and veg", ingredient: "New potatoes", quantity: 400, unit: grams, emoji: "🥔" },
  { category: "Fruit and veg", ingredient: "Green beans", quantity: 200, unit: grams, emoji: "🫛" },
  { category: "Cupboard", ingredient: "Jasmine rice", quantity: 375, unit: grams, emoji: "🍚" },
  { category: "Cupboard", ingredient: "Rolled oats", quantity: 100, unit: grams, emoji: "🌾" },
  { category: "Cupboard", ingredient: "Peanut butter", quantity: 45, unit: grams, emoji: "🥜" },
  { category: "Bakery", ingredient: "Wholemeal wraps", quantity: 2, emoji: "🌯" },
];

function fullPlan(id: string): SharedMealPlan {
  const start = nextMonday();
  const week: [Recipe, Recipe, Recipe, Recipe | null][] = [
    [yogurt, chickenRice, salmon, applePb],
    [porridge, halloumiWrap, beefBowl, null],
    [yogurt, chickenRice, salmon, applePb],
    [porridge, halloumiWrap, beefBowl, null],
    [yogurt, chickenRice, beefBowl, applePb],
  ];
  const days: PlanDay[] = week.map(([b, l, d, s], i) => ({
    date: utcMidnight(i, start),
    breakfast: meal(b),
    lunch: meal(l),
    dinner: meal(d),
    snack: s ? meal(s) : null,
  }));
  return { _id: id, days, groceries };
}

function legacyPlan(id: string): SharedMealPlan {
  // London local midnight in summer: 23:00 UTC the day before.
  const start = new Date(nextMonday().getTime() - 3_600_000);
  const days: PlanDay[] = [
    { date: utcMidnight(0, start), breakfast: meal(porridge), lunch: meal(chickenRice), dinner: meal(salmon), snack: null },
    { date: utcMidnight(1, start), breakfast: null, lunch: null, dinner: null, snack: null },
    { date: utcMidnight(2, start), breakfast: meal(yogurt), lunch: null, dinner: meal(beefBowl), snack: null },
  ];
  return { _id: id, days, groceries: [] };
}

export function getSharedPlanFixture(id: string): SharedMealPlan | null {
  if (!sharedPlanFixturesEnabled) return null;
  if (id === SHARED_PLAN_FIXTURE_IDS.FULL) return fullPlan(id);
  if (id === SHARED_PLAN_FIXTURE_IDS.LEGACY) return legacyPlan(id);
  if (id === SHARED_PLAN_FIXTURE_IDS.PENDING) {
    return { ...fullPlan(id), groceries: [], groceriesPending: true };
  }
  return null;
}
