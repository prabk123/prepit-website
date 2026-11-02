/**
 * The web quiz (PRE-322, PRE-329, PRE-327; v9.2 screens and replies,
 * PRE-441): its screens, answers, copy and the rules that pick between them,
 * from Charlie's quiz v9.2 board. Kept free of
 * React and browser APIs (and of runtime imports) so it can be tested on its
 * own; the screens themselves are src/app/quiz.
 *
 * Answers stay in this browser until the visitor signs in on the cart
 * (PRE-323, PRE-437). The quiz ends at the loader and hands off to the cart
 * (PRE-446); only the cart's "Email me my plan" (PRE-439) sends them earlier,
 * to `POST /web-leads`.
 */
import type { WebSignupAnswer, WebSignupSettings, WebSignupUser } from "../funnel/webSignupProfile";
import type { StartingPointId } from "../funnel/bridgeHandoff";
import type { VisualKey } from "./replyVisuals";

export const QUIZ_FUNNEL_ID = "quiz";
/** Sent with every save, so answers can be told apart when the questions change. */
export const QUIZ_FUNNEL_VERSION = "quiz-v4";

/**
 * Flexitarian, Halal and Kosher need backend values and plan rules (PRE-328)
 * and the app build that reads them (fresca_app #226). Until that ships they
 * are not offered. Turning this on shows them; the save then keeps whatever
 * the backend accepts.
 */
export const EXTRA_FOOD_RULES_ENABLED = false;

// ---------------------------------------------------------------- screens

export const SECTIONS = ["Goals", "Your day", "About you", "Your plan"] as const;

export type ScreenId =
  | "goal"
  | "echo-goal"
  | "blockers"
  | "echo-blocker"
  | "day"
  | "echo-signals"
  | "history"
  | "demo"
  | "gender"
  | "numbers"
  | "stop-age"
  | "safety"
  | "stop-ed"
  | "goalweight"
  | "activity"
  | "exercise"
  | "diet"
  | "intol"
  | "week"
  | "echo-plans"
  | "loader";

type Screen = { id: ScreenId; section: number; branch?: boolean };

/**
 * In order, from the v9.2 card list: 19 screens to the loader on the Lose fat
 * and Build muscle paths, 18 on the others (no goal weight). Branch screens
 * are only reached from the screen before them.
 */
export const SCREENS: readonly Screen[] = [
  { id: "goal", section: 0 },
  { id: "echo-goal", section: 0 },
  { id: "blockers", section: 0 },
  { id: "echo-blocker", section: 0 },
  { id: "day", section: 1 },
  { id: "echo-signals", section: 1 },
  { id: "history", section: 1 },
  { id: "demo", section: 1 },
  { id: "gender", section: 2 },
  { id: "numbers", section: 2 },
  { id: "stop-age", section: 2, branch: true },
  { id: "safety", section: 2 },
  { id: "stop-ed", section: 2, branch: true },
  { id: "goalweight", section: 2 },
  { id: "activity", section: 2 },
  { id: "exercise", section: 2 },
  { id: "diet", section: 2 },
  { id: "intol", section: 2 },
  { id: "week", section: 3 },
  { id: "echo-plans", section: 3 },
  { id: "loader", section: 3 },
];

/**
 * The step id analytics sees. Both stop screens are "stop", so no event says
 * whether someone is under 18 or ticked an eating disorder (health data).
 */
export function analyticsStepId(id: ScreenId): string {
  return isStopScreen(id) ? "stop" : id;
}

export function isStopScreen(id: ScreenId): boolean {
  return id === "stop-age" || id === "stop-ed";
}

// ---------------------------------------------------------------- answers

/** Weight units: pounds, kilograms, or stones and pounds. */
export type Unit = "imperial" | "metric" | "stones";
export type HeightUnit = "ft" | "cm";

/** "Your day" picks (v9.2), as the backend stores them (`day_patterns`, PRE-435). */
export type DayPattern = "dip" | "low" | "hungry" | "mood" | "none";

export type QuizAnswers = {
  goal?: string;
  /** In the order tapped: the first one picks the sticking-point reply. */
  blockers: string[];
  dayPatterns: DayPattern[];
  history?: string;
  gender?: string;
  dobDay: string;
  /** "01" to "12", or "" before one is picked. */
  dobMonth: string;
  dobYear: string;
  heightUnit: HeightUnit;
  /** The weight unit; goal weight uses it too. */
  unit: Unit;
  heightCm: string;
  weightKg: string;
  feet: string;
  inches: string;
  pounds: string;
  stones: string;
  stonePounds: string;
  safety: string[];
  /** As typed, in the visitor's units (stones only, with goalStonePounds, for stones). */
  goalWeightText: string;
  /** The pounds part of a goal weight in stones. */
  goalStonePounds?: string;
  /** Always kilograms, from goalWeightText. */
  goalWeightKg?: number;
  activity?: string;
  exercise?: string;
  diet?: string;
  intolerances: string[];
  rules: string[];
  /** "None of these" on allergies and food rules, so Continue means an answer. */
  noFoodRules: boolean;
  /** The loader's two questions. */
  skipsBreakfast?: "Yes" | "No";
  eveningSnacks?: "Yes" | "No";
};

/**
 * Units by country (v9.2), with a switch on the card: feet and pounds in the
 * US, Liberia and Myanmar, feet and stones in the UK and Ireland, centimetres
 * and kilograms everywhere else. Everything is sent in cm and kg.
 */
export function unitsFor(country: string | null | undefined): { heightUnit: HeightUnit; unit: Unit } {
  const code = (country ?? "US").toUpperCase();
  if (["US", "LR", "MM", "PR"].includes(code)) return { heightUnit: "ft", unit: "imperial" };
  if (code === "GB" || code === "IE") return { heightUnit: "ft", unit: "stones" };
  return { heightUnit: "cm", unit: "metric" };
}

/** Month before day only where dates are written that way (the US). */
export function monthFirst(country: string | null | undefined): boolean {
  return ["US", "PR"].includes((country ?? "US").toUpperCase());
}

/** Body numbers start empty (never pre-filled); only the units follow the country. US first (PRE-322). */
export function emptyAnswers(country: string | null = "US"): QuizAnswers {
  return {
    blockers: [],
    dayPatterns: [],
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    ...unitsFor(country),
    heightCm: "",
    weightKg: "",
    feet: "",
    inches: "",
    pounds: "",
    stones: "",
    stonePounds: "",
    safety: [],
    goalWeightText: "",
    intolerances: [],
    rules: [],
    noFoodRules: false,
  };
}

// ---------------------------------------------------------------- options

export type Option = { value: string; label?: string; detail?: string; tag?: string; exclusive?: boolean };

export const GOAL_OPTIONS: Option[] = [
  { value: "Lose fat", detail: "Reduce body fat while keeping muscle" },
  { value: "Build muscle", detail: "Gain strength and lean mass" },
  { value: "Improve energy", detail: "Eat for steadier energy throughout the day" },
  { value: "Stay fuller", detail: "Understand what keeps you satisfied" },
  { value: "Eat healthier", detail: "Build a better nutrition baseline" },
  { value: "Fuel training", detail: "Fuel workouts and recovery" },
  { value: "Maintain", detail: "Keep your current weight and perform" },
];

const GOAL_VALUES: Record<string, string> = {
  "Lose fat": "lose weight",
  "Build muscle": "gain muscle",
  "Improve energy": "improve energy",
  "Stay fuller": "stay fuller",
  "Eat healthier": "eat healthier",
  "Fuel training": "fuel training",
  Maintain: "maintain weight",
};

export const BLOCKER_OPTIONS: Option[] = [
  { value: "Logging takes too long", label: "Keeping a food diary takes too long", tag: "Keeping track" },
  { value: "I get hungry", tag: "Get hungry" },
  { value: "I lose motivation", tag: "Motivation" },
  { value: "I don't know what to eat", tag: "What to eat" },
  { value: "I eat out or socialise a lot", tag: "Eating out" },
  { value: "Weekends derail me", tag: "Weekends" },
  { value: "I feel tired", tag: "Feel tired" },
  { value: "I crave snacks", tag: "Crave snacks" },
];

/** "Your day": energy, hunger and mood as one pick-any list (v9.2). */
export const DAY_OPTIONS: Option[] = [
  { value: "dip", label: "My energy dips mid-afternoon" },
  { value: "low", label: "My energy is low most days" },
  { value: "hungry", label: "I'm hungry between meals" },
  { value: "mood", label: "Food changes how I feel" },
  { value: "none", label: "None of these. My days feel steady.", exclusive: true },
];

/**
 * The older energy, hunger and mood answers a "Your day" pick stands for, as
 * the backend writes them (PRE-435 `legacyDayAnswers`). The starting point
 * reads these, and the save sends them too for any reader of the old ids.
 */
export function dayAnswers(a: Pick<QuizAnswers, "dayPatterns">): { energy: string; hunger: string; mood: string } | null {
  const d = a.dayPatterns;
  if (!d.length) return null;
  return {
    energy: d.includes("dip") ? "I dip mid-afternoon" : d.includes("low") ? "Low most days" : "Steady all day",
    hunger: d.includes("hungry") ? "Most days" : "Rarely",
    mood: d.includes("mood") ? "Yes, often" : "Not really",
  };
}

export const HISTORY_OPTIONS: Option[] = [
  { value: "Yes, with an app" },
  { value: "Yes, notes or photos" },
  { value: "I started, then stopped" },
  { value: "Never" },
];

export const GENDER_OPTIONS: Option[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "rather not say", label: "Rather not say" },
];

export const SAFETY_PREGNANT = "Pregnant or breastfeeding";
export const SAFETY_EATING_DISORDER = "An eating disorder, now or in the past";
export const SAFETY_CONDITION = "A health condition that affects what I eat";
export const SAFETY_NONE = "None of these";

export const SAFETY_OPTIONS: Option[] = [
  { value: SAFETY_PREGNANT },
  { value: SAFETY_EATING_DISORDER },
  { value: SAFETY_CONDITION },
  { value: SAFETY_NONE, exclusive: true },
];

export const ACTIVITY_OPTIONS: Option[] = [
  { value: "mostly_sitting", label: "Mostly sitting", detail: "Desk job, drive to work, little walking" },
  { value: "lightly_on_feet", label: "Lightly on feet", detail: "Teacher, retail, regular walking" },
  { value: "on_feet_most_of_day", label: "On feet most of the day", detail: "Nurse, server, warehouse work" },
  { value: "physically_demanding", label: "Physically demanding", detail: "Construction, farming, heavy labour" },
];

export const EXERCISE_OPTIONS: Option[] = [
  { value: "none", label: "No exercise", detail: "No structured workouts" },
  { value: "one_to_two", label: "Light exercise", detail: "1 to 2 days a week" },
  { value: "three_to_five", label: "Moderate exercise", detail: "3 to 5 days a week" },
  { value: "six_to_seven", label: "Heavy exercise", detail: "6 to 7 days a week" },
  { value: "athlete", label: "Athlete", detail: "Training twice a day" },
];

const ALL_DIET_OPTIONS: (Option & { extra?: boolean })[] = [
  { value: "eat everything", label: "Eat everything", detail: "Nothing off the menu" },
  { value: "flexitarian", label: "Flexitarian", detail: "Mostly plants, some meat or fish", extra: true },
  { value: "pescetarian", label: "Pescatarian", detail: "Fish, but no meat" },
  { value: "vegetarian", label: "Vegetarian", detail: "No meat or fish" },
  { value: "vegan", label: "Vegan", detail: "No animal foods" },
];

export function dietOptions(extraFoodRules = EXTRA_FOOD_RULES_ENABLED): Option[] {
  return ALL_DIET_OPTIONS.filter((option) => extraFoodRules || !option.extra).map((option) => ({
    value: option.value,
    label: option.label,
    detail: option.detail,
  }));
}

const DIET_LEAVES_OUT: Record<string, string[]> = {
  pescetarian: ["meat"],
  vegetarian: ["meat and fish"],
  vegan: ["all animal foods"],
};

/** [value sent, label, noun in "Plans leave out …"]. Values are the app's. */
export const ALLERGENS: [string, string, string][] = [
  ["Dairy", "Dairy", "dairy"],
  ["Egg", "Egg", "eggs"],
  ["Gluten", "Gluten", "gluten"],
  ["Soy", "Soy", "soy"],
  ["Peanut", "Peanut", "peanuts"],
  ["Tree Nuts", "Tree nuts", "tree nuts"],
  ["Sesame", "Sesame", "sesame"],
  ["Fish", "Fish", "fish"],
  ["Shellfish", "Shellfish", "shellfish"],
  ["Crustacean", "Crustacean", "crustaceans"],
  ["Mollusc", "Mollusc", "molluscs"],
  ["Corn", "Corn", "corn"],
  ["Sulfites", "Sulfites", "sulfites"],
  ["Mustard", "Mustard", "mustard"],
  ["Celery", "Celery", "celery"],
  ["Lupin", "Lupin", "lupin"],
];

type FoodRule = { label: string; value: string; leavesOut: string[]; extra?: boolean };

/** "No pork" and friends send the app's existing Pork, Beef and Alcohol intolerances. */
const ALL_FOOD_RULES: FoodRule[] = [
  { label: "Halal", value: "Halal", leavesOut: ["pork", "alcohol"], extra: true },
  { label: "Kosher", value: "Kosher", leavesOut: ["pork", "shellfish", "crustaceans", "molluscs"], extra: true },
  { label: "No pork", value: "Pork", leavesOut: ["pork"] },
  { label: "No beef", value: "Beef", leavesOut: ["beef"] },
  { label: "No alcohol", value: "Alcohol", leavesOut: ["alcohol"] },
];

export function foodRules(extraFoodRules = EXTRA_FOOD_RULES_ENABLED): FoodRule[] {
  return ALL_FOOD_RULES.filter((rule) => extraFoodRules || !rule.extra);
}

/** Halal and kosher are diets in the app (PRE-328), with the foods they rule out. */
const RULE_DIETS: Record<string, { diet: string; label: string; foods: string[] }> = {
  Halal: { diet: "halal", label: "Halal", foods: ["Pork", "Alcohol"] },
  Kosher: { diet: "kosher", label: "Kosher", foods: ["Pork", "Shellfish", "Crustacean", "Mollusc"] },
};

/**
 * The diet and intolerances saved for the answers, as the app saves them
 * (PRE-328): with Eat everything, halal or kosher becomes the diet; with any
 * other diet (or a second rule) the rule's foods join the intolerances.
 * "No pork" and friends are intolerances already.
 */
export function savedDiet(a: QuizAnswers): { diet?: string; intolerances: string[] } {
  let diet = a.diet;
  const intolerances = [...a.intolerances];
  const add = (item: string) => {
    if (!intolerances.some((existing) => existing.toLowerCase() === item.toLowerCase())) intolerances.push(item);
  };
  for (const rule of a.rules) {
    const ruleDiet = RULE_DIETS[rule];
    if (!ruleDiet) add(rule);
    else if (!diet || diet === "eat everything") diet = ruleDiet.diet;
    else ruleDiet.foods.forEach(add);
  }
  return { diet, intolerances };
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LOADER_STEPS = [
  "Reading your answers",
  "Setting your daily targets",
  "Finding your starting point",
  "Saving your answers to your plan",
];

/** The loader pauses at these percentages for a yes or no question. */
export const LOADER_QUESTIONS: { at: number; eyebrow: string; question: string; key: "skipsBreakfast" | "eveningSnacks" }[] = [
  { at: 38, eyebrow: "Quick question", question: "Do you often skip breakfast?", key: "skipsBreakfast" },
  { at: 71, eyebrow: "Last one", question: "Are evenings when you snack most?", key: "eveningSnacks" },
];

/** The marketing box's wording, saved with the lead as the consent record. */
export const MARKETING_CONSENT_TEXT = "Send me tips and offers from PrepIt. Unsubscribe any time.";

// ---------------------------------------------------------------- body maths

const LB_TO_KG = 0.4536;

function num(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/** Whole years old on `today`, or null until the date is complete and real. */
export function ageFrom(a: Pick<QuizAnswers, "dobDay" | "dobMonth" | "dobYear">, today = new Date()): number | null {
  const year = Number(a.dobYear);
  const month = Number(a.dobMonth);
  const day = Number(a.dobDay);
  if (!/^\d{4}$/.test(a.dobYear) || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (date > today) return null;
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
  return age;
}

/** The date of birth as the backend wants it (YYYY-MM-DD), or undefined. */
export function dobIso(a: QuizAnswers): string | undefined {
  if (ageFrom(a) === null) return undefined;
  return `${a.dobYear}-${a.dobMonth.padStart(2, "0")}-${a.dobDay.padStart(2, "0")}`;
}

export function heightCm(a: QuizAnswers): number | null {
  const value = a.heightUnit === "cm" ? num(a.heightCm) : (num(a.feet) * 12 + (num(a.inches) || 0)) * 2.54;
  return Number.isFinite(value) && value >= 50 && value <= 272 ? Math.round(value) : null;
}

export function weightKg(a: QuizAnswers): number | null {
  const value =
    a.unit === "metric"
      ? num(a.weightKg)
      : a.unit === "stones"
        ? (num(a.stones) * 14 + (num(a.stonePounds) || 0)) * LB_TO_KG
        : num(a.pounds) * LB_TO_KG;
  return Number.isFinite(value) && value >= 20 && value <= 400 ? Math.round(value * 10) / 10 : null;
}

/** A weight in the visitor's units, e.g. "176 lb", "12 st 8 lb" or "80 kg". */
export function weightText(kg: number, unit: Unit): string {
  if (unit === "metric") return `${Math.round(kg)} kg`;
  const lb = Math.round(kg / LB_TO_KG);
  if (unit === "stones") return `${Math.floor(lb / 14)} st ${lb % 14} lb`;
  return `${lb} lb`;
}

/** A goal weight typed in the visitor's units (pounds unless metric), as kilograms. */
export function toKg(text: string, unit: Unit): number | undefined {
  const value = num(text);
  if (!Number.isFinite(value)) return undefined;
  return unit === "metric" ? value : Math.round(value * LB_TO_KG * 10) / 10;
}

/** A goal weight as typed, in kilograms. Stones take a stones box and a pounds box. */
export function goalKg(text: string, unit: Unit, stonePounds = ""): number | undefined {
  if (unit !== "stones") return toKg(text, unit);
  const stones = num(text);
  if (!Number.isFinite(stones)) return undefined;
  const pounds = stonePounds.trim() === "" ? 0 : num(stonePounds);
  if (!Number.isFinite(pounds)) return undefined;
  return toKg(String(stones * 14 + pounds), "imperial");
}

/** BMI 18.5 to 24.9 for their height, in kilograms. */
export function healthyRange(cm: number): [number, number] {
  const m = cm / 100;
  return [Math.ceil(18.5 * m * m), Math.floor(24.9 * m * m)];
}

export function isPregnant(a: QuizAnswers): boolean {
  return a.safety.includes(SAFETY_PREGNANT);
}

const WEIGHT_GOALS = ["Lose fat", "Build muscle"];

// ---------------------------------------------------------------- navigation

export function isVisible(id: ScreenId, a: QuizAnswers): boolean {
  if (id === "goalweight") return WEIGHT_GOALS.includes(a.goal ?? "") && !isPregnant(a);
  return true;
}

/** The screen after `id`, or null at the end (or on a stop screen). */
export function nextScreen(id: ScreenId, a: QuizAnswers, today = new Date()): ScreenId | null {
  if (id === "numbers") {
    const age = ageFrom(a, today);
    if (age !== null && age < 18) return "stop-age";
  }
  if (id === "safety" && a.safety.includes(SAFETY_EATING_DISORDER)) return "stop-ed";
  if (isStopScreen(id)) return null;
  const from = SCREENS.findIndex((screen) => screen.id === id);
  for (const screen of SCREENS.slice(from + 1)) {
    if (!screen.branch && isVisible(screen.id, a)) return screen.id;
  }
  return null;
}

export function sectionOf(id: ScreenId): number {
  return SCREENS.find((screen) => screen.id === id)?.section ?? 0;
}

/** How full each section's bar is (0 to 1), eased as in the design. */
export function progress(id: ScreenId, a: QuizAnswers): number[] {
  const path = SCREENS.filter((screen) => !screen.branch && isVisible(screen.id, a));
  const position = Math.max(0, path.findIndex((screen) => screen.id === id));
  const current = sectionOf(id);
  return SECTIONS.map((_, section) => {
    if (section < current) return 1;
    if (section > current) return 0;
    const inSection = path.filter((screen) => screen.section === section);
    const done = inSection.filter((screen) => path.indexOf(screen) < position).length;
    const fraction = inSection.length ? done / inSection.length : 0;
    return 1 - Math.pow(1 - fraction, 1.5);
  });
}

/** Whether the screen's answer lets the visitor go on. */
export function canContinue(id: ScreenId, a: QuizAnswers, today = new Date()): boolean {
  switch (id) {
    case "blockers":
      return a.blockers.length > 0;
    case "day":
      return a.dayPatterns.length > 0;
    case "safety":
      return a.safety.length > 0;
    case "numbers": {
      const age = ageFrom(a, today);
      return age !== null && age < 110 && heightCm(a) !== null && weightKg(a) !== null;
    }
    case "goalweight":
      return a.goalWeightKg !== undefined && a.goalWeightKg >= 20 && a.goalWeightKg <= 400 && goalWeightProblem(a) === null;
    case "diet":
      return Boolean(a.diet);
    case "intol":
      return a.noFoodRules || a.intolerances.length > 0 || a.rules.length > 0;
    default:
      return true;
  }
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.trim().length <= 254;
}

// ---------------------------------------------------------------- copy

/**
 * A reply screen (v9.2): the eyebrow that mirrors the answer, the headline,
 * the nutritionist's own line (first person, under the AI label), an optional
 * study behind "Source", and the visual options in order of preference
 * (replyVisuals.ts picks one that repeats no earlier capture).
 */
export type Reply = { eyebrow: string; headline: string; say: string; source?: string; visuals: VisualKey[] };

const GOAL_REPLIES: Record<string, Omit<Reply, "eyebrow">> = {
  "Lose fat": {
    headline: "Lose fat in a way you can keep up.",
    say: "You might want a few swaps to meals you love, or the whole week planned. I can do either, around your targets, and nothing changes until you say so.",
    visuals: ["swap"],
  },
  "Build muscle": {
    headline: "I'll handle the food side of building muscle.",
    say: "I set protein and calorie targets for building muscle, then show how close each day gets. If you're short, I'll suggest food you'd actually eat to get there.",
    visuals: ["chart"],
  },
  "Improve energy": {
    headline: "Steadier energy starts with seeing what each meal does.",
    say: "Every meal you log shows how it moved your Energy, and why. Within a few days you'll see which meals keep you going, and I'll help you build on them.",
    visuals: ["energy"],
  },
  "Stay fuller": {
    headline: "Find the meals that actually keep you full.",
    say: "Every meal gets a Satiety score, so you can see which ones carry you to the next. Then I'll help you eat more of the meals that last.",
    visuals: ["satiety"],
  },
  "Eat healthier": {
    headline: "Eating healthier, without the guesswork.",
    say: "Ask me anything about food and I'll answer from your own meals and targets. A few small upgrades or a whole new week: we go at your pace.",
    visuals: ["ask"],
  },
  "Fuel training": {
    headline: "Fuel that matches how hard you train.",
    say: "Your targets will match how often you train. Then I'll show how your protein and carbs stack up each day, so you train fuelled and recover well.",
    visuals: ["macros"],
  },
  Maintain: {
    headline: "Hold your weight and keep feeling your best.",
    say: "I keep your targets at maintenance and show what each meal does for your Energy, Satiety and Mood. Each weekly check-in helps you catch any drift early.",
    visuals: ["checkin"],
  },
};

export function goalReply(a: QuizAnswers): Reply {
  const goal = GOAL_REPLIES[a.goal ?? ""] ? (a.goal as string) : "Maintain";
  return { eyebrow: `You said · ${goal}`, ...GOAL_REPLIES[goal] };
}

/** By the sticking point tapped first (v9.2; the live quiz used a fixed order). */
const BLOCKER_REPLIES: Record<string, Omit<Reply, "eyebrow"> & { short: string }> = {
  "Logging takes too long": {
    short: "Food diary",
    headline: "Log a meal as fast as a text.",
    say: "Type it, say it or snap it. No searching, no weighing. I work out the numbers, and you can change anything after.",
    visuals: ["logchat"],
  },
  "I don't know what to eat": {
    short: "What to eat",
    headline: "What to eat, answered before you're hungry.",
    say: "Ask me for an idea any time and I'll answer from your targets and tastes. Or let me plan your week, so tonight's dinner is already decided.",
    visuals: ["today", "today2"],
  },
  "I lose motivation": {
    short: "Motivation",
    headline: "Motivation comes and goes. A clear next step stays.",
    say: "I don't need you perfect. Log what you can, and each week we pick one thing to focus on, so you always know what's next.",
    visuals: ["focus"],
  },
  "Weekends derail me": {
    short: "Weekends",
    headline: "Weekends aren't a willpower problem. They're a planning problem.",
    say: "I can give weekends more room and take a little from weekdays, keeping your weekly total the same. Or we plan the weekend's meals together. Your call.",
    visuals: ["weekly", "weekly2"],
  },
  "I eat out or socialise a lot": {
    short: "Eating out",
    headline: "Eating out doesn't have to undo your week.",
    say: "Describe a restaurant meal in a sentence and I'll work it out. If some days always run bigger, I can give them more room and keep your weekly total.",
    visuals: ["social"],
  },
  "I feel tired": {
    short: "Tired",
    headline: "Let's find the meals that give you energy back.",
    say: "Tell me when tiredness hits and I'll look at what you ate before it. Your Energy score shows which meals lift you.",
    visuals: ["dipmsg", "dipmsg2"],
  },
  "I crave snacks": {
    short: "Cravings",
    headline: "Cravings make more sense once you see the pattern.",
    say: "Snacks aren't banned here. Log them like any meal and I'll look at what comes before a craving, so you're not fighting it on willpower alone.",
    visuals: ["snacks"],
  },
  "I get hungry": {
    short: "Hunger",
    headline: "Getting hungry is a signal, not a failing.",
    say: "I look at what you ate before the hunger hit, then suggest swaps or meals that hold you longer. Your Satiety score shows what's working.",
    visuals: ["hunger"],
  },
};

/** The reply to the first sticking point tapped; null only if none was picked. */
export function blockerReply(a: QuizAnswers): Reply {
  const first = a.blockers.find((b) => BLOCKER_REPLIES[b]);
  // Continue needs a pick, so the fallback (the first option's reply, with no answer to mirror) is never shown.
  const { short, ...reply } = BLOCKER_REPLIES[first ?? BLOCKER_OPTIONS[0].value];
  return { eyebrow: first ? `Your sticking point · ${short}` : "Your sticking point", ...reply };
}

/** The "Your day" pick the scores reply leads with. */
export function dayKind(a: Pick<QuizAnswers, "dayPatterns">): DayPattern {
  for (const kind of ["dip", "low", "hungry", "mood"] as const) if (a.dayPatterns.includes(kind)) return kind;
  return "none";
}

const SCORES_REPLIES: Record<DayPattern, Reply> = {
  dip: {
    eyebrow: "You said · Energy dips mid-afternoon",
    headline: "Let's see what's behind your afternoon dip.",
    say: "Your Energy score updates as you log, so you can see what lunch does to your afternoon. No wearable, no guesswork.",
    visuals: ["dip", "dip2", "dip3"],
  },
  low: {
    eyebrow: "You said · Energy is low most days",
    headline: "Energy is your score to watch.",
    say: "Every meal shows how it moved your Energy. Over a week you'll see which days you had more of it, and what you ate on them.",
    visuals: ["low", "low2"],
  },
  hungry: {
    eyebrow: "You said · Hungry between meals",
    headline: "Satiety is your score to watch.",
    say: "Snacks count like meals here. Each one shows how it moved your Satiety, so you can see what carries you to the next meal.",
    visuals: ["hungry", "hungry2"],
  },
  mood: {
    eyebrow: "You said · Food changes how you feel",
    headline: "Mood starts with yesterday's food.",
    say: "Your Mood score is worked out from yesterday's log, so you can connect what you eat with how you feel the next day.",
    source: "White, Horwath and Conner 2013, Br J Health Psychol. 281 young adults over 21 days: more fruit and veg went with a better mood the next day.",
    visuals: ["mood"],
  },
  none: {
    eyebrow: "You said · Steady all day",
    headline: "Steady already. Let's keep it that way.",
    say: "Your scores show which meals keep you there, so you know exactly what's working.",
    visuals: ["steady2", "steady4", "steady", "steady3"],
  },
};

export function scoresReply(a: QuizAnswers): Reply {
  return SCORES_REPLIES[dayKind(a)];
}

const DEMO_REPLIES: Record<string, Omit<Reply, "eyebrow">> = {
  "Yes, with an app": {
    headline: "No food database. Just tell me what you ate.",
    say: "Describe a meal like a text. I research it, and it's on your day in seconds. Change anything after.",
    visuals: ["typed"],
  },
  "Yes, notes or photos": {
    headline: "Keep the photo. Skip the maths.",
    say: "Snap the plate or say it in a sentence. I work out the numbers, and you can change anything after.",
    visuals: ["photo"],
  },
  "I started, then stopped": {
    headline: "Log often. Not for long.",
    say: "In one study, the people who did best logged often and quickly. Here a meal is one sentence, typed or said, and you can fix anything after.",
    source: "Harvey et al. 2019, Obesity. 142 adults over 24 weeks: those who did best logged more often, and spent less time doing it.",
    visuals: ["typed"],
  },
  Never: {
    headline: "Here's all it takes.",
    say: "Describe a meal the way you'd text a friend. I work out the rest in seconds.",
    visuals: ["typed"],
  },
};

/** The demo, by tracking history; the eyebrow always shows their real answer. */
export function demoReply(a: QuizAnswers): Reply {
  const history = DEMO_REPLIES[a.history ?? ""] ? (a.history as string) : "Never";
  return { eyebrow: `You said · ${history}`, ...DEMO_REPLIES[history] };
}

export const PLANS_REPLY: Reply = {
  eyebrow: "Meal plans",
  headline: "After a few days, I can plan your week.",
  say: "By then I've seen how you really eat, so the plan fits. You get a day-by-day draft, a grocery list and a cost estimate. Want one sooner? Just ask.",
  visuals: ["plan", "plan2"],
};

/** The metabolism line on "Your numbers", for ages 20 to 59 only. */
export function numbersReply(a: QuizAnswers, today = new Date()): string {
  const age = ageFrom(a, today);
  if (age === null || age < 20 || age > 59) return "";
  return `Good news: metabolism holds steady from 20 to 60, once body size is counted. I'll set your targets for age ${age}.`;
}

export const SITTING_REPLY = "That's most office days. I set your targets from the day you really have, not an ideal one.";

export function safetyReply(a: QuizAnswers): string {
  if (a.safety.includes(SAFETY_PREGNANT)) {
    return "Your plan won't set a weight-loss target. For anything specific to pregnancy, I'll point you to your doctor or midwife.";
  }
  if (a.safety.includes(SAFETY_CONDITION)) {
    return "PrepIt is a coach, not a doctor. Check any big change with your doctor or specialist first.";
  }
  return "";
}

/** Why the goal weight can't be used yet, or null. Neither weight goal goes below the healthy range. */
export function goalWeightProblem(a: QuizAnswers): string | null {
  const cm = heightCm(a);
  if (a.goalWeightKg === undefined || cm === null || a.goalWeightKg < 20) return null;
  const [low] = healthyRange(cm);
  if (WEIGHT_GOALS.includes(a.goal ?? "") && a.goalWeightKg < low) {
    return `That's below the healthy range for your height. Your goal needs to be ${weightText(low, a.unit)} or more.`;
  }
  return null;
}

export function goalWeightReply(a: QuizAnswers): string {
  const cm = heightCm(a);
  if (cm === null) return "";
  const problem = goalWeightProblem(a);
  if (problem) return problem;
  const [low, high] = healthyRange(cm);
  return `A healthy range for your height is ${weightText(low, a.unit)} to ${weightText(high, a.unit)}. I won't set a goal below it.`;
}

function joinList(items: string[]): string {
  if (items.length < 2) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** "Plans leave out …" from the diet, allergies and food rules, or "". */
export function leaveOutLine(a: QuizAnswers, extraFoodRules = EXTRA_FOOD_RULES_ENABLED): string {
  const items: string[] = [];
  const add = (item: string) => {
    if (!items.includes(item)) items.push(item);
  };
  (DIET_LEAVES_OUT[a.diet ?? ""] ?? []).forEach(add);
  for (const value of a.intolerances) {
    const allergen = ALLERGENS.find(([v]) => v === value);
    if (allergen) add(allergen[2]);
  }
  for (const value of a.rules) foodRules(extraFoodRules).find((rule) => rule.value === value)?.leavesOut.forEach(add);
  if (!items.length) return "";
  let line = `Plans leave out ${joinList(items)}.`;
  if (a.rules.includes("Halal")) line += " Choose halal-certified meat when you shop.";
  if (a.intolerances.length) line += " If you have an allergy, always check labels.";
  return line;
}

const GOAL_NOUNS: Record<string, string> = {
  "Lose fat": "fat-loss",
  "Build muscle": "muscle-building",
  "Improve energy": "energy",
  "Stay fuller": "satiety",
  "Eat healthier": "nutrition",
  "Fuel training": "training",
  Maintain: "maintenance",
};

/** The quiz's goal label for a saved goal value, e.g. "lose weight" to "Lose fat". */
export function goalLabelFor(value: string | null | undefined): string | undefined {
  return Object.keys(GOAL_VALUES).find((label) => GOAL_VALUES[label] === value);
}

/** The diet's label for a saved diet value, e.g. "pescetarian" to "Pescatarian". */
export function dietLabelFor(value: string | null | undefined): string | undefined {
  return (
    ALL_DIET_OPTIONS.find((option) => option.value === value)?.label ??
    Object.values(RULE_DIETS).find((rule) => rule.diet === value)?.label
  );
}

/** The plan email's page headline from the saved goal and name. */
export function savedPlanHeadline(goalValue: string | null | undefined, firstName: string | null | undefined): string {
  const noun = GOAL_NOUNS[goalLabelFor(goalValue) ?? ""] ?? "personalised";
  const name = firstName?.trim();
  return `${name ? `${name}, your` : "Your"} ${noun} plan`;
}

export function resultTags(a: QuizAnswers): string[] {
  const blockerTags = a.blockers.slice(0, 2).map((v) => BLOCKER_OPTIONS.find((o) => o.value === v)?.tag ?? v);
  const diet = a.diet && a.diet !== "eat everything" ? ALL_DIET_OPTIONS.find((o) => o.value === a.diet)?.label ?? "" : "";
  const rules = a.rules.map((v) => ALL_FOOD_RULES.find((rule) => rule.value === v)?.label ?? v);
  const allergens = a.intolerances.map((v) => `No ${ALLERGENS.find(([value]) => value === v)?.[2] ?? v.toLowerCase()}`);
  return [a.goal ?? "", ...blockerTags, diet, ...rules, ...allergens].filter(Boolean).slice(0, 6);
}

/** The bridge's "your plan" card (PRE-323): the goal and first two sticking points, plus the targets. */
export function planSummary(a: QuizAnswers, targets?: Targets | null): { tags?: string[]; calories?: number; proteinGrams?: number } {
  const tags = resultTags(a).slice(0, 1 + Math.min(2, a.blockers.length));
  return {
    tags: tags.length ? tags : undefined,
    calories: targets?.calories,
    proteinGrams: targets?.protein,
  };
}

export type StartingPoint = { name: string; why: string; line: string };

export function startingPoint(a: QuizAnswers): StartingPoint {
  const b = a.blockers;
  const { energy: dayEnergy, hunger } = dayAnswers(a) ?? {};
  if (dayEnergy === "I dip mid-afternoon" || dayEnergy === "Low most days" || b.includes("I feel tired")) {
    const energy =
      dayEnergy === "I dip mid-afternoon"
        ? "your energy dips in the afternoon"
        : dayEnergy === "Low most days"
          ? "your energy is low most days"
          : "tiredness gets in the way";
    return {
      name: dayEnergy === "I dip mid-afternoon" ? "The afternoon dip" : "The energy gap",
      why: `You said ${energy}${a.skipsBreakfast === "Yes" ? " and you often skip breakfast" : ""}.`,
      line: "Your Energy score looks at breakfast, morning protein and how sugary your carbs are, so the food side of it shows up.",
    };
  }
  if (b.includes("Weekends derail me") || b.includes("I eat out or socialise a lot")) {
    return {
      name: "The weekend swing",
      why: "Weekdays go to plan. Weekends and meals out are harder.",
      line: "Your nutritionist can give the weekend more room and keep the weekly total the same.",
    };
  }
  if (
    a.eveningSnacks === "Yes" ||
    b.includes("I crave snacks") ||
    b.includes("I get hungry") ||
    hunger === "Most days"
  ) {
    const said: string[] = [];
    if (a.eveningSnacks === "Yes") said.push("evenings are when you snack most");
    if (b.includes("I crave snacks")) said.push("snack cravings get in the way");
    if (b.includes("I get hungry") || hunger === "Most days") said.push("hunger shows up between meals");
    return {
      name: a.eveningSnacks === "Yes" ? "The evening graze" : "The between-meal graze",
      why: `You said ${joinList(said.slice(0, 2))}.`,
      line: "Your Satiety score looks at the gaps between meals too, so a long afternoon shows up.",
    };
  }
  if (b.includes("I don't know what to eat")) {
    return {
      name: "The 6pm question",
      why: "Deciding what to eat is the hard part.",
      line: "Your nutritionist can plan the week, so dinner is already decided.",
    };
  }
  if (b.includes("Logging takes too long") || b.includes("I lose motivation")) {
    return {
      name: "Keeping it going",
      why: "You said keeping track takes too long or motivation fades.",
      line: "Here you describe a meal in one sentence, and one weekly focus keeps it simple.",
    };
  }
  return {
    name: "Your baseline",
    why: "You didn't flag a sticking point, which is a good start.",
    line: "Your first few days of meals will show what's already working.",
  };
}

/**
 * The same first sticking point as `startingPoint`, as the id the cart reads
 * (PRE-437: its "For…" and "You said…" lines). Keep the two in step.
 */
export function startingPointId(a: QuizAnswers): StartingPointId {
  const b = a.blockers;
  const { energy, hunger } = dayAnswers(a) ?? {};
  if (energy === "I dip mid-afternoon") return a.skipsBreakfast === "Yes" ? "dip_breakfast" : "dip";
  if (energy === "Low most days") return "low";
  if (b.includes("I feel tired")) return "tired";
  if (b.includes("Weekends derail me") || b.includes("I eat out or socialise a lot")) return "weekend";
  if (a.eveningSnacks === "Yes") return "evening";
  if (b.includes("I get hungry") || hunger === "Most days") return "graze";
  if (b.includes("I crave snacks")) return "cravings";
  if (b.includes("I don't know what to eat")) return "dinner";
  if (b.includes("Logging takes too long") || b.includes("I lose motivation")) return "going";
  return "none";
}

/** Protein leads the targets for muscle and training goals. */
export function proteinFirst(a: QuizAnswers): boolean {
  return a.goal === "Build muscle" || a.goal === "Fuel training";
}

/** Day `n` of the trial, counting today as day 1, e.g. "Tue, Oct 21". */
export function trialDay(n: number, today = new Date()): string {
  const date = new Date(today);
  date.setDate(date.getDate() + n - 1);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ---------------------------------------------------------------- saving

/**
 * The goal weight sent for targets and the account. When the goal-weight
 * screen is hidden (goals without a weight target, or pregnant or
 * breastfeeding) it is the current weight, as the app does
 * (`goalsWithoutWeightTarget`): the backend needs one to create the account,
 * and the same weight means maintenance, never a deficit.
 */
function goalWeightForTargets(a: QuizAnswers): number | undefined {
  if (isVisible("goalweight", a)) return a.goalWeightKg;
  return weightKg(a) ?? undefined;
}

/** The body for the public `POST /onboarding/calculate-nutritional-goals`, or null if answers are missing. */
export function targetsRequest(a: QuizAnswers): Record<string, unknown> | null {
  const height = heightCm(a);
  const weight = weightKg(a);
  const dob = dobIso(a);
  const goal = GOAL_VALUES[a.goal ?? ""];
  if (!height || !weight || !dob || !goal || !a.gender || !a.activity || !a.exercise) return null;
  const goalWeight = goalWeightForTargets(a);
  return {
    gender: a.gender,
    weight,
    height,
    dob,
    dailyActivity: a.activity,
    exerciseFrequency: a.exercise,
    goal,
    ...(goalWeight !== undefined ? { goalWeight } : {}),
  };
}

export type Targets = { calories: number; protein: number; carbs: number; fats: number; resolvedGoalSpeed?: number };

/** Reads the targets response; null when it isn't the shape we expect. */
export function parseTargets(body: unknown): Targets | null {
  if (!body || typeof body !== "object") return null;
  const { nutritionalGoals, resolvedGoalSpeed } = body as { nutritionalGoals?: Record<string, unknown>; resolvedGoalSpeed?: unknown };
  if (!nutritionalGoals) return null;
  const pick = (key: string) => {
    const value = nutritionalGoals[key];
    return typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null;
  };
  const calories = pick("calories");
  const protein = pick("protein");
  const carbs = pick("carbs");
  const fats = pick("fats");
  if (calories === null || protein === null || carbs === null || fats === null) return null;
  return {
    calories,
    protein,
    carbs,
    fats,
    resolvedGoalSpeed: typeof resolvedGoalSpeed === "number" ? resolvedGoalSpeed : undefined,
  };
}

/** Quiz questions with no account field go in `answers`, as the app's nutritionist reads them. */
const ANSWER_QUESTIONS: { id: string; text: string; read: (a: QuizAnswers) => WebSignupAnswer["answer"] | undefined }[] = [
  // v9.2 "Your day" (PRE-435 stores it and writes the three older answers from it).
  { id: "day_patterns", text: "Which of these sound like your day?", read: (a) => (a.dayPatterns.length ? a.dayPatterns : undefined) },
  // Also sent, so a backend from before PRE-435 still gets them; PRE-435 rewrites them from day_patterns.
  { id: "afternoon_energy", text: "How's your energy most afternoons?", read: (a) => dayAnswers(a)?.energy },
  { id: "hunger_between_meals", text: "How often are you hungry between meals?", read: (a) => dayAnswers(a)?.hunger },
  { id: "food_and_mood", text: "Do you notice food changing how you feel?", read: (a) => dayAnswers(a)?.mood },
  { id: "tracking_history", text: "Have you tried keeping track of what you eat before?", read: (a) => a.history },
  {
    id: "safety",
    text: "Does any of this apply to you right now?",
    read: (a) => (a.safety.length ? a.safety : undefined),
  },
  { id: "skips_breakfast", text: "Do you often skip breakfast?", read: (a) => a.skipsBreakfast },
  { id: "evening_snacks", text: "Are evenings when you snack most?", read: (a) => a.eveningSnacks },
];

/** What the cart sends at sign-in (and with "Email me my plan"): answers, account fields and settings. */
export function buildQuizProfile(
  a: QuizAnswers,
  targets?: Targets | null,
): { answers: WebSignupAnswer[]; user: WebSignupUser; settings: WebSignupSettings } {
  const answers: WebSignupAnswer[] = [];
  for (const question of ANSWER_QUESTIONS) {
    const answer = question.read(a);
    if (answer !== undefined) answers.push({ questionId: question.id, questionText: question.text, answer });
  }
  const user: WebSignupUser = {
    dob: dobIso(a),
    gender: a.gender,
    height: heightCm(a) ?? undefined,
    weight: weightKg(a) ?? undefined,
  };
  const goalWeight = goalWeightForTargets(a);
  const settings: WebSignupSettings = {
    goal: GOAL_VALUES[a.goal ?? ""],
    goalWeight,
    goalSpeed: targets?.resolvedGoalSpeed,
    dailyActivity: a.activity,
    exerciseFrequency: a.exercise,
    ...savedDiet(a),
    mainBlocker: a.blockers.length ? a.blockers : undefined,
    // From the weight unit. The app has no stones; it shows pounds for them.
    unit: a.unit === "metric" ? "metric" : "imperial",
  };
  return { answers, user, settings };
}
