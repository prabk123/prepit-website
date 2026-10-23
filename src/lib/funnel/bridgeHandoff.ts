/**
 * The shared bridge (PRE-323): one route, `/start`, that the landing page
 * (PRE-302) and the quiz (PRE-322) both send people to. It signs them in with
 * Google or Apple, saves their web sign-up, then shows the RevenueCat paywall.
 *
 * Handoff contract for the pages that link here:
 *
 * - URL: `/start?from=landing|quiz&plan=annual|monthly&funnel=<funnel id>`.
 *   `from` picks the header, `plan` is optional, `funnel` defaults to
 *   `direct-sale`. Build it with `bridgePath` (params.ts).
 * - The quiz calls `writeBridgeHandoff` with its answers before linking here.
 *   They stay in this browser (localStorage) until the visitor signs in; the
 *   bridge then sends them with `PATCH /web-signup/profile` and clears them
 *   once the account exists. The quiz never calls the backend itself.
 * - The quiz's session id (`prepit.webSessionId`, PRE-327) is read here and
 *   sent on every sign-in, so the email gate's lead is matched to the account.
 *
 * Kept free of React so it can be tested on its own.
 */
import type { BridgeSource } from "./params";
import type { HealthConsent, WebSignupAnswer, WebSignupSettings, WebSignupUser } from "./webSignupProfile";

/** What the quiz leaves for the bridge. */
export type BridgeHandoff = {
  funnelId: string;
  funnelVersion?: string;
  answers?: WebSignupAnswer[];
  user?: WebSignupUser;
  settings?: WebSignupSettings;
  /** The quiz's health consent box (PRE-358); null when unticked, and then the health answers aren't here. */
  healthConsent?: HealthConsent | null;
  /** The name the quiz asked for; used only when the sign-in has none (Apple often sends none). */
  firstName?: string;
  /** The email gate's address; a hint for Google's account picker, never sent to the backend from here. */
  email?: string;
  /** What the bridge's "your plan" card shows: the quiz's chips and daily targets. */
  planSummary?: { tags?: string[]; calories?: number; proteinGrams?: number };
};

export const BRIDGE_HANDOFF_KEY = "prepit.bridgeHandoff";
/** Written by the quiz (PRE-322) once per browser; the PRE-327 lead is saved under it. */
export const WEB_SESSION_ID_KEY = "prepit.webSessionId";
/** Answers older than this are dropped rather than sent. */
const HANDOFF_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const WEB_SESSION_ID = /^[A-Za-z0-9_.:-]{8,128}$/;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Parses a stored handoff, keeping only the known fields. Exported for tests. */
export function parseBridgeHandoff(raw: string | null, now = Date.now()): BridgeHandoff | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const value = parsed as Record<string, unknown>;
  if (typeof value.savedAt !== "number" || now - value.savedAt > HANDOFF_MAX_AGE_MS) return null;
  if (typeof value.funnelId !== "string") return null;
  const text = (field: unknown, max: number) =>
    typeof field === "string" && field.trim() ? field.trim().slice(0, max) : undefined;
  const object = <T>(field: unknown) => (field && typeof field === "object" && !Array.isArray(field) ? (field as T) : undefined);
  return {
    funnelId: /^[a-z0-9][a-z0-9-]{0,39}$/.test(value.funnelId) ? value.funnelId : "quiz",
    funnelVersion: text(value.funnelVersion, 64),
    answers: Array.isArray(value.answers) ? (value.answers as WebSignupAnswer[]) : undefined,
    user: object<WebSignupUser>(value.user),
    settings: object<WebSignupSettings>(value.settings),
    healthConsent: parseHealthConsent(value.healthConsent),
    firstName: text(value.firstName, 100),
    email: text(value.email, 320),
    planSummary: parsePlanSummary(value.planSummary),
  };
}

function parseHealthConsent(value: unknown): HealthConsent | null | undefined {
  if (value === null) return null;
  const raw = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  return raw && typeof raw.version === "string" && raw.version.trim() && typeof raw.text === "string"
    ? { version: raw.version, text: raw.text }
    : undefined;
}

function parsePlanSummary(value: unknown): BridgeHandoff["planSummary"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const number = (field: unknown, max: number) =>
    typeof field === "number" && Number.isFinite(field) && field > 0 && field < max ? Math.round(field) : undefined;
  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((tag): tag is string => typeof tag === "string" && tag.trim() !== "").map((tag) => tag.trim().slice(0, 40)).slice(0, 4)
    : undefined;
  const summary = { tags: tags?.length ? tags : undefined, calories: number(raw.calories, 10000), proteinGrams: number(raw.proteinGrams, 1000) };
  return summary.tags || summary.calories || summary.proteinGrams ? summary : undefined;
}

export function writeBridgeHandoff(handoff: BridgeHandoff): void {
  try {
    storage()?.setItem(BRIDGE_HANDOFF_KEY, JSON.stringify({ ...handoff, savedAt: Date.now() }));
  } catch {
    // Storage full or blocked: the app asks the missing questions instead.
  }
}

export function readBridgeHandoff(): BridgeHandoff | null {
  try {
    return parseBridgeHandoff(storage()?.getItem(BRIDGE_HANDOFF_KEY) ?? null);
  } catch {
    return null;
  }
}

export function clearBridgeHandoff(): void {
  try {
    storage()?.removeItem(BRIDGE_HANDOFF_KEY);
  } catch {
    // Nothing to clear.
  }
}

/** The quiz's session id, or undefined when this browser has none (or a bad one). */
export function readWebSessionId(): string | undefined {
  try {
    const id = storage()?.getItem(WEB_SESSION_ID_KEY)?.trim();
    return id && WEB_SESSION_ID.test(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

/**
 * What the bridge knew when it showed checkout, for the "You're in" page
 * after it: which page they came from and whether they got the free week.
 * Session storage, so it ends with the tab. Checkout (RevenueCat) owns the
 * redirect, so this can't travel in the URL.
 */
export type BridgeVisit = { from: BridgeSource; trial: boolean };

const BRIDGE_VISIT_KEY = "prepit.bridgeVisit";

export function writeBridgeVisit(visit: BridgeVisit): void {
  try {
    if (typeof window !== "undefined") window.sessionStorage.setItem(BRIDGE_VISIT_KEY, JSON.stringify(visit));
  } catch {
    // Blocked storage: the success page uses its defaults.
  }
}

/** Parses a stored visit. Exported for tests. */
export function parseBridgeVisit(raw: string | null): BridgeVisit | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if ((value.from !== "landing" && value.from !== "quiz") || typeof value.trial !== "boolean") return null;
    return { from: value.from, trial: value.trial };
  } catch {
    return null;
  }
}

export function readBridgeVisit(): BridgeVisit | null {
  try {
    return typeof window === "undefined" ? null : parseBridgeVisit(window.sessionStorage.getItem(BRIDGE_VISIT_KEY));
  } catch {
    return null;
  }
}
