/**
 * Building the body for `PATCH /web-signup/profile` (fresca_backend PRE-262,
 * `savePendingProfileSchema`). Kept free of browser APIs so it can be tested
 * on its own; the request itself is `saveWebSignupProfile` in prepitApi.ts.
 */
import type { Attribution } from "./attribution";

/** One quiz answer as the backend stores it. */
export type WebSignupAnswer = {
  /** Stable id from the funnel's question definitions, e.g. "goal" or "main_blocker". */
  questionId: string;
  /** The question as the visitor saw it, for the nutritionist and support. */
  questionText?: string;
  answer: string | number | boolean | (string | number)[] | null;
};

/** Account fields the backend copies into the account (same values as `POST /account`). */
export type WebSignupUser = {
  /** The quiz's name; the backend prefers it over the sign-in's, so only send it when the sign-in has none. */
  firstName?: string;
  dob?: string;
  gender?: string;
  height?: number;
  weight?: number;
};

export type WebSignupSettings = {
  goal?: string;
  goalWeight?: number;
  goalSpeed?: number;
  dailyActivity?: string;
  exerciseFrequency?: string;
  diet?: string;
  intolerances?: string[];
  mainBlocker?: string[];
  unit?: "metric" | "imperial";
};

/** The quiz's ticked health consent box (PRE-358): its wording and version. The backend stamps the time. */
export type HealthConsent = { version: string; text: string };

export type WebSignupInput = {
  funnelId?: string;
  funnelVersion?: string;
  answers?: WebSignupAnswer[];
  user?: WebSignupUser;
  settings?: WebSignupSettings;
  attribution?: Attribution | null;
  /** The quiz's ticked health consent box; null when it was left unticked (withdraws an earlier one). */
  healthConsent?: HealthConsent | null;
  /** Make the account as soon as the answers are enough. The backend's default is true. */
  createAccount?: boolean;
  /** The quiz session id the email gate saved a lead under (PRE-327). */
  webSessionId?: string;
};

const QUESTION_ID = /^[A-Za-z0-9_:-]{1,64}$/;
const MAX_ANSWERS = 100;
const WEB_SESSION_ID = /^[A-Za-z0-9_.:-]{8,128}$/;

// The values `pendingProfileUserSchema` / `pendingProfileSettingsSchema` accept
// (fresca_backend services/pendingProfile.ts and the User / Settings models).
const GENDERS = ["male", "female", "non-binary", "rather not say"];
const GOALS = [
  "lose weight",
  "gain muscle",
  "maintain weight",
  "eat healthier",
  "improve energy",
  "stay fuller",
  "fuel training",
];
const DAILY_ACTIVITIES = ["mostly_sitting", "lightly_on_feet", "on_feet_most_of_day", "physically_demanding"];
const EXERCISE_FREQUENCIES = ["none", "one_to_two", "three_to_five", "six_to_seven", "athlete"];
// Flexitarian, halal and kosher are backend diets since PRE-328; the quiz only sends them behind its flag.
const DIETS = ["eat everything", "flexitarian", "vegan", "vegetarian", "pescetarian", "halal", "kosher", "high protein", "low carb", "keto"];

function cap(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function cleanAnswer(answer: WebSignupAnswer["answer"]): WebSignupAnswer["answer"] | undefined {
  if (answer === null || typeof answer === "boolean") return answer;
  if (typeof answer === "number") return Number.isFinite(answer) ? answer : undefined;
  if (typeof answer === "string") return cap(answer, 2000);
  if (Array.isArray(answer)) {
    return answer
      .filter((item) => typeof item === "string" || (typeof item === "number" && Number.isFinite(item)))
      .slice(0, 50)
      .map((item) => (typeof item === "string" ? cap(item, 500) : item));
  }
  return undefined;
}

function inRange(value: number | undefined, min: number, max: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : undefined;
}

function oneOf<T extends string>(value: T | undefined, allowed: readonly string[], lowercase = false): T | undefined {
  if (typeof value !== "string") return undefined;
  const normalised = lowercase ? value.trim().toLowerCase() : value;
  return allowed.includes(normalised) ? (normalised as T) : undefined;
}

function shortStrings(values: string[] | undefined, max: number): string[] | undefined {
  if (!Array.isArray(values)) return undefined;
  return values
    .filter((item): item is string => typeof item === "string" && item.trim() !== "")
    .map((item) => cap(item.trim(), 200))
    .slice(0, max);
}

/** An ISO date that isn't in the future, as `Joi.date().iso().max("now")` wants. */
function pastIsoDate(value: string | undefined): string | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value)) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) && time <= Date.now() ? value : undefined;
}

function withoutEmpty<T extends Record<string, unknown>>(value: T): T | undefined {
  const kept = Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
  return Object.keys(kept).length > 0 ? kept : undefined;
}

/** A consent record the backend accepts (`healthConsentSchema`), or undefined. */
export function cleanHealthConsent(value: unknown): HealthConsent | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const { version, text } = value as Record<string, unknown>;
  if (typeof version !== "string" || !version.trim() || typeof text !== "string") return undefined;
  return { version: cap(version.trim(), 64), text: cap(text, 1000) };
}

/** Only the account fields, and values, the backend accepts; anything else is left out. */
export function cleanWebSignupUser(user: WebSignupUser | undefined): WebSignupUser | undefined {
  if (!user) return undefined;
  const firstName = typeof user.firstName === "string" ? user.firstName.trim() : "";
  return withoutEmpty({
    firstName: firstName ? cap(firstName, 100) : undefined,
    dob: pastIsoDate(user.dob),
    gender: oneOf(user.gender, GENDERS),
    height: inRange(user.height, 50, 272),
    weight: inRange(user.weight, 20, 400),
  });
}

/** Only the settings, and values, the backend accepts; anything else is left out. */
export function cleanWebSignupSettings(settings: WebSignupSettings | undefined): WebSignupSettings | undefined {
  if (!settings) return undefined;
  return withoutEmpty({
    goal: oneOf(settings.goal, GOALS, true),
    goalWeight: inRange(settings.goalWeight, 20, 400),
    goalSpeed: inRange(settings.goalSpeed, 0, 2),
    dailyActivity: oneOf(settings.dailyActivity, DAILY_ACTIVITIES),
    exerciseFrequency: oneOf(settings.exerciseFrequency, EXERCISE_FREQUENCIES),
    diet: oneOf(settings.diet, DIETS),
    intolerances: shortStrings(settings.intolerances, 30),
    mainBlocker: shortStrings(settings.mainBlocker, 20),
    unit: oneOf(settings.unit, ["metric", "imperial"]),
  });
}

/**
 * The request body, trimmed to what the backend accepts so one bad answer
 * can't get the whole save refused: answers with a bad id or value are
 * dropped, later answers to the same question win, at most 100 are sent, and
 * account fields or settings outside the backend's ranges are left out.
 */
export function buildWebSignupBody(input: WebSignupInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const funnelId = input.funnelId?.trim();
  if (funnelId) body.funnelId = cap(funnelId, 64);
  const funnelVersion = input.funnelVersion?.trim();
  if (funnelVersion) body.funnelVersion = cap(funnelVersion, 64);

  if (input.answers) {
    const byId = new Map<string, WebSignupAnswer>();
    for (const item of input.answers) {
      if (!QUESTION_ID.test(item.questionId)) continue;
      const answer = cleanAnswer(item.answer);
      if (answer === undefined) continue;
      byId.delete(item.questionId);
      byId.set(item.questionId, {
        questionId: item.questionId,
        ...(item.questionText !== undefined ? { questionText: cap(item.questionText, 500) } : {}),
        answer,
      });
    }
    body.answers = [...byId.values()].slice(-MAX_ANSWERS);
  }

  const user = cleanWebSignupUser(input.user);
  if (user) body.user = user;
  const settings = cleanWebSignupSettings(input.settings);
  if (settings) body.settings = settings;
  if (input.attribution && Object.keys(input.attribution).length > 0) body.attribution = input.attribution;
  if (input.healthConsent === null) body.healthConsent = null;
  else {
    const healthConsent = cleanHealthConsent(input.healthConsent);
    if (healthConsent) body.healthConsent = healthConsent;
  }
  if (input.createAccount !== undefined) body.createAccount = input.createAccount;
  if (input.webSessionId && WEB_SESSION_ID.test(input.webSessionId)) body.webSessionId = input.webSessionId;
  return body;
}
