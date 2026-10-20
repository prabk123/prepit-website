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

export type WebSignupInput = {
  funnelId?: string;
  funnelVersion?: string;
  answers?: WebSignupAnswer[];
  user?: WebSignupUser;
  settings?: WebSignupSettings;
  attribution?: Attribution | null;
  /** Make the account as soon as the answers are enough. The backend's default is true. */
  createAccount?: boolean;
};

const QUESTION_ID = /^[A-Za-z0-9_:-]{1,64}$/;
const MAX_ANSWERS = 100;

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

/**
 * The request body, trimmed to what the backend accepts so one bad answer
 * can't get the whole save refused: answers with a bad id or value are
 * dropped, later answers to the same question win, and at most 100 are sent.
 */
export function buildWebSignupBody(input: WebSignupInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.funnelId) body.funnelId = cap(input.funnelId.trim(), 64);
  if (input.funnelVersion) body.funnelVersion = cap(input.funnelVersion.trim(), 64);

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

  if (input.user && Object.keys(input.user).length > 0) body.user = input.user;
  if (input.settings && Object.keys(input.settings).length > 0) body.settings = input.settings;
  if (input.attribution && Object.keys(input.attribution).length > 0) body.attribution = input.attribution;
  if (input.createAccount !== undefined) body.createAccount = input.createAccount;
  return body;
}
