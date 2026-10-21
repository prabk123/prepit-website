/**
 * The web quiz (PRE-322, PRE-329, PRE-327): its screens, answers, copy and
 * the rules that pick between them, from the v3 quiz design. Kept free of
 * React and browser APIs (and of runtime imports) so it can be tested on its
 * own; the screens themselves are src/app/quiz.
 *
 * Answers stay in this browser until the visitor signs in on the bridge
 * (PRE-323). Only the email gate sends them earlier, to `POST /web-leads`.
 */
import type { WebSignupAnswer, WebSignupSettings, WebSignupUser } from "../funnel/webSignupProfile";

export const QUIZ_FUNNEL_ID = "quiz";
/** Sent with every save, so answers can be told apart when the questions change. */
export const QUIZ_FUNNEL_VERSION = "quiz-v3";

/**
 * Flexitarian, Halal and Kosher need backend values and plan rules (PRE-328)
 * and the app build that reads them (fresca_app #226). Until that ships they
 * are not offered. Turning this on shows them; the save then keeps whatever
 * the backend accepts.
 */
export const EXTRA_FOOD_RULES_ENABLED = false;

// ---------------------------------------------------------------- screens

export const SECTIONS = ["Goals", "About you", "Your day", "Your plan"] as const;

export type ScreenId =
  | "goal"
  | "echo-goal"
  | "blockers"
  | "echo-blocker"
  | "energy"
  | "hunger"
  | "mood"
  | "echo-signals"
  | "history"
  | "demo"
  | "gender"
  | "dob"
  | "stop-age"
  | "hw"
  | "safety"
  | "stop-ed"
  | "goalweight"
  | "activity"
  | "exercise"
  | "diet"
  | "intol"
  | "mealhelp"
  | "echo-plans"
  | "style"
  | "week"
  | "loader"
  | "email"
  | "name"
  | "result";

type Screen = { id: ScreenId; section: number; branch?: boolean };

/** In order. Branch screens are only reached from the screen before them. */
export const SCREENS: readonly Screen[] = [
  { id: "goal", section: 0 },
  { id: "echo-goal", section: 0 },
  { id: "blockers", section: 0 },
  { id: "echo-blocker", section: 0 },
  { id: "energy", section: 0 },
  { id: "hunger", section: 0 },
  { id: "mood", section: 0 },
  { id: "echo-signals", section: 0 },
  { id: "history", section: 1 },
  { id: "demo", section: 1 },
  { id: "gender", section: 1 },
  { id: "dob", section: 1 },
  { id: "stop-age", section: 1, branch: true },
  { id: "hw", section: 1 },
  { id: "safety", section: 1 },
  { id: "stop-ed", section: 1, branch: true },
  { id: "goalweight", section: 1 },
  { id: "activity", section: 2 },
  { id: "exercise", section: 2 },
  { id: "diet", section: 2 },
  { id: "intol", section: 2 },
  { id: "mealhelp", section: 2 },
  { id: "echo-plans", section: 2 },
  { id: "style", section: 2 },
  { id: "week", section: 3 },
  { id: "loader", section: 3 },
  { id: "email", section: 3 },
  { id: "name", section: 3 },
  { id: "result", section: 3 },
];

/**
 * The step id analytics sees. The eating-disorder stop is "stop-safety" so
 * no event names the condition.
 */
export function analyticsStepId(id: ScreenId): string {
  return id === "stop-ed" ? "stop-safety" : id;
}

export function isStopScreen(id: ScreenId): boolean {
  return id === "stop-age" || id === "stop-ed";
}

// ---------------------------------------------------------------- answers

export type Unit = "imperial" | "metric" | "stones";

export type QuizAnswers = {
  goal?: string;
  blockers: string[];
  energy?: string;
  hunger?: string;
  mood?: string;
  history?: string;
  gender?: string;
  dobDay: string;
  /** "01" to "12", or "" before one is picked. */
  dobMonth: string;
  dobYear: string;
  unit: Unit;
  heightCm: string;
  weightKg: string;
  feet: string;
  inches: string;
  pounds: string;
  stones: string;
  stonePounds: string;
  safety: string[];
  /** As typed, in the visitor's units (pounds for feet and stones). */
  goalWeightText: string;
  /** Always kilograms, from goalWeightText. */
  goalWeightKg?: number;
  activity?: string;
  exercise?: string;
  diet?: string;
  intolerances: string[];
  rules: string[];
  mealHelp?: string;
  style?: string;
  /** The loader's two questions. */
  skipsBreakfast?: "Yes" | "No";
  eveningSnacks?: "Yes" | "No";
  email: string;
  marketingConsent: boolean;
  firstName: string;
};

/** US first (PRE-322): feet and pounds, month before day. */
export function emptyAnswers(): QuizAnswers {
  return {
    blockers: [],
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    unit: "imperial",
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
    email: "",
    marketingConsent: false,
    firstName: "",
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

export const ENERGY_OPTIONS: Option[] = [
  { value: "Steady all day" },
  { value: "I dip mid-afternoon" },
  { value: "Up and down" },
  { value: "Low most days" },
];

export const HUNGER_OPTIONS: Option[] = [
  { value: "Rarely" },
  { value: "Sometimes" },
  { value: "Most days" },
  { value: "I graze all day" },
];

export const MOOD_OPTIONS: Option[] = [
  { value: "Not really" },
  { value: "Sometimes, after big meals" },
  { value: "Yes, often" },
  { value: "I'd like to find out" },
];

export const HISTORY_OPTIONS: Option[] = [
  { value: "Yes, with an app" },
  { value: "Yes, notes or photos" },
  { value: "I started, then stopped" },
  { value: "Never" },
];

export const GENDER_OPTIONS: Option[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
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

export const MEAL_HELP_OPTIONS: Option[] = [
  { value: "Planning the week and the shop" },
  { value: "Ideas when I'm stuck" },
  { value: "Eating out and takeaways" },
  { value: "Better versions of what I already eat" },
];

export const STYLE_OPTIONS: Option[] = [
  { value: "Short nudges", detail: "Tell me the one thing to do" },
  { value: "The detail and the why", detail: "Show me what's behind it" },
];

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
  const value = a.unit === "metric" ? num(a.heightCm) : (num(a.feet) * 12 + (num(a.inches) || 0)) * 2.54;
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
  if (id === "dob") {
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
    case "safety":
      return a.safety.length > 0;
    case "dob": {
      const age = ageFrom(a, today);
      return age !== null && age < 110;
    }
    case "hw":
      return heightCm(a) !== null && weightKg(a) !== null;
    case "goalweight":
      return a.goalWeightKg !== undefined && a.goalWeightKg >= 20 && a.goalWeightKg <= 400 && goalWeightProblem(a) === null;
    case "diet":
      return Boolean(a.diet);
    case "email":
      return isEmail(a.email);
    default:
      return true;
  }
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.trim().length <= 254;
}

// ---------------------------------------------------------------- copy

export type MediaKey = "protein" | "chart" | "planHead" | "swap" | "signals" | "satiety" | "rings" | "weekly" | "voice" | "home";

export type Reply = { headline: string; body: string; media: MediaKey[] };

const GOAL_REPLIES: Record<string, Reply> = {
  "Lose fat": {
    headline: "You don't need another number. You need to know what to change.",
    body: "PrepIt is an AI nutritionist. Your nutritionist reads what you eat, spots the patterns, then tells you the one thing to change first.",
    media: ["protein", "chart"],
  },
  "Build muscle": {
    headline: "Hit your protein without living on shakes.",
    body: "Your nutritionist reads your week and shows where the protein is missing, meal by meal.",
    media: ["chart", "protein"],
  },
  "Eat healthier": {
    headline: "Not sure what to eat? Your nutritionist plans the week. You just confirm it.",
    body: "Meals that fit your targets, your diet and how you actually eat.",
    media: ["planHead", "swap"],
  },
  "Improve energy": {
    headline: "Find out what's behind the 3pm slump.",
    body: "PrepIt gives every day an Energy score from what you ate, and shows which meals moved it.",
    media: ["signals", "rings"],
  },
  "Stay fuller": {
    headline: "Feel full and steady, not hungry and snappy.",
    body: "PrepIt gives every day a Satiety score, so you can see which meals keep you going.",
    media: ["satiety", "signals"],
  },
  "Fuel training": {
    headline: "Eat for the session, not just the scale.",
    body: "Connect Apple Health and your nutritionist sees your workouts next to your meals, and tells you what to change.",
    media: ["rings", "signals"],
  },
  Maintain: {
    headline: "Keep what's working. Notice what isn't.",
    body: "Energy, Satiety and Mood scores every day, and a check-in every week.",
    media: ["weekly", "rings"],
  },
};

export function goalReply(a: QuizAnswers): Reply {
  return GOAL_REPLIES[a.goal ?? ""] ?? GOAL_REPLIES.Maintain;
}

/** The first match wins, in this order. */
const BLOCKER_REPLIES: { when: (b: string[]) => boolean; reply: Reply }[] = [
  {
    when: (b) => b.includes("Logging takes too long"),
    reply: {
      headline: "Type it, say it or snap your plate.",
      body: "Type “two eggs and buttered toast”, send a voice note or take a photo. It's on your day straight away, and you can change anything after.",
      media: ["voice"],
    },
  },
  {
    when: (b) => b.includes("I don't know what to eat"),
    reply: {
      headline: "Your nutritionist plans the week. You just confirm.",
      body: "Meals that fit your targets and your diet, with the grocery list attached.",
      media: ["planHead", "swap"],
    },
  },
  {
    when: (b) => b.includes("I lose motivation"),
    reply: {
      headline: "One thing to work on. Not ten.",
      body: "After about 3 days of meals, your nutritionist shows you the patterns and you pick one focus together. Every week, a check-in suggests the next one.",
      media: ["protein", "weekly"],
    },
  },
  {
    when: (b) => b.includes("Weekends derail me") || b.includes("I eat out or socialise a lot"),
    reply: {
      headline: "Weekends aren't a willpower problem. They're a planning problem.",
      body: "Give busier days more room and keep the week on track. Your nutritionist suggests the pattern; you confirm it.",
      media: ["weekly", "planHead"],
    },
  },
  {
    when: (b) => b.includes("I crave snacks") || b.includes("I get hungry"),
    reply: {
      headline: "See which meals actually keep you full.",
      body: "Every meal you describe moves your Satiety score, so the snacks you reach for start to make sense.",
      media: ["satiety", "signals"],
    },
  },
  {
    when: () => true,
    reply: {
      headline: "See what your meals do to your energy.",
      body: "Every meal you describe moves your Energy score. Your nutritionist tells you which ones help.",
      media: ["signals", "rings"],
    },
  },
];

export function blockerReply(a: QuizAnswers): Reply {
  return BLOCKER_REPLIES.find((entry) => entry.when(a.blockers))!.reply;
}

/** One app screen per reply page, never the same one twice. */
export function mediaPlan(a: QuizAnswers): { goal: MediaKey; blocker: MediaKey; signals: MediaKey; plans: MediaKey } {
  const used = new Set<MediaKey>();
  const pick = (keys: MediaKey[]) => {
    const key = keys.find((k) => !used.has(k)) ?? keys[0];
    used.add(key);
    return key;
  };
  return {
    goal: pick(goalReply(a).media),
    blocker: pick(blockerReply(a).media),
    signals: pick(["rings", "home"]),
    plans: pick(["planHead", "swap"]),
  };
}

export function signalsLine(a: QuizAnswers): string {
  if (a.energy === "I dip mid-afternoon" || a.energy === "Low most days" || a.energy === "Up and down") {
    const said =
      a.energy === "Up and down" ? "goes up and down" : a.energy === "Low most days" ? "is low most days" : "dips mid-afternoon";
    return `You said your energy ${said}. Energy is the one to watch first.`;
  }
  if (a.hunger === "Most days" || a.hunger === "I graze all day") {
    return "You said you're often hungry between meals. Satiety is the one to watch first.";
  }
  return "Your scores show what's already working, so you keep it.";
}

export function demoCopy(a: QuizAnswers): { headline: string; body: string } {
  const quit = a.history === "I started, then stopped" || a.history === "Yes, with an app";
  const body = "Describe a meal the way you'd text a friend. Your nutritionist researches it and it lands on your day in seconds.";
  return quit
    ? { headline: "Tracking always starts well. Then it gets annoying.", body: `So PrepIt works differently. ${body}` }
    : { headline: "Here's all it takes.", body };
}

export function safetyReply(a: QuizAnswers): string {
  if (a.safety.includes(SAFETY_PREGNANT)) {
    return "Your plan won't set a weight-loss target. For anything specific to pregnancy, your nutritionist will point you to your doctor or midwife.";
  }
  if (a.safety.includes(SAFETY_CONDITION)) {
    return "PrepIt is a coach, not a doctor. Check any big change with your doctor or specialist first.";
  }
  return "";
}

/** Why the goal weight can't be used yet, or null. */
export function goalWeightProblem(a: QuizAnswers): string | null {
  const cm = heightCm(a);
  if (a.goalWeightKg === undefined || cm === null || a.goalWeightKg < 20) return null;
  const [low] = healthyRange(cm);
  if (a.goal === "Lose fat" && a.goalWeightKg < low) {
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
  return `A healthy weight range for your height is ${weightText(low, a.unit)} to ${weightText(high, a.unit)}.`;
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

export function resultHeadline(a: QuizAnswers): string {
  const noun = GOAL_NOUNS[a.goal ?? ""] ?? "personalised";
  const name = a.firstName.trim();
  return `${name ? `${name}, your` : "Your"} ${noun} plan is ready`;
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
  if (a.energy === "I dip mid-afternoon" || a.energy === "Low most days" || b.includes("I feel tired")) {
    const energy =
      a.energy === "I dip mid-afternoon"
        ? "your energy dips in the afternoon"
        : a.energy === "Low most days"
          ? "your energy is low most days"
          : "tiredness gets in the way";
    return {
      name: a.energy === "I dip mid-afternoon" ? "The afternoon dip" : "The energy gap",
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
    a.hunger === "Most days" ||
    a.hunger === "I graze all day"
  ) {
    const said: string[] = [];
    if (a.eveningSnacks === "Yes") said.push("evenings are when you snack most");
    if (b.includes("I crave snacks")) said.push("snack cravings get in the way");
    if (b.includes("I get hungry") || a.hunger === "Most days" || a.hunger === "I graze all day") said.push("hunger shows up between meals");
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
  { id: "afternoon_energy", text: "How's your energy most afternoons?", read: (a) => a.energy },
  { id: "hunger_between_meals", text: "How often are you hungry between meals?", read: (a) => a.hunger },
  { id: "food_and_mood", text: "Do you notice food changing how you feel?", read: (a) => a.mood },
  { id: "tracking_history", text: "Have you tried keeping track of what you eat before?", read: (a) => a.history },
  {
    id: "safety",
    text: "Does any of this apply to you right now?",
    read: (a) => (a.safety.length ? a.safety : undefined),
  },
  { id: "meal_help", text: "Where would help with meals make the biggest difference?", read: (a) => a.mealHelp },
  { id: "advice_style", text: "How do you like advice?", read: (a) => a.style },
  { id: "skips_breakfast", text: "Do you often skip breakfast?", read: (a) => a.skipsBreakfast },
  { id: "evening_snacks", text: "Are evenings when you snack most?", read: (a) => a.eveningSnacks },
];

/** What the bridge and the email gate send: answers, account fields and settings. */
export function buildQuizProfile(
  a: QuizAnswers,
  targets?: Targets | null,
): { answers: WebSignupAnswer[]; user: WebSignupUser; settings: WebSignupSettings } {
  const answers: WebSignupAnswer[] = [];
  for (const question of ANSWER_QUESTIONS) {
    const answer = question.read(a);
    if (answer !== undefined) answers.push({ questionId: question.id, questionText: question.text, answer });
  }
  const firstName = a.firstName.trim();
  const user: WebSignupUser = {
    ...(firstName ? { firstName } : {}),
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
    // The app has no stones; it shows pounds for them.
    unit: a.unit === "metric" ? "metric" : "imperial",
  };
  return { answers, user, settings };
}
