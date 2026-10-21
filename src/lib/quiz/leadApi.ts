/**
 * The backend's public endpoints the quiz and the email pages call, with no
 * sign-in: the daily targets (`POST /onboarding/calculate-nutritional-goals`)
 * and the email gate's lead store (fresca_backend PRE-327, contract in
 * /web2app/pre-327-lead-api-contract.md). Tokens from email links go in the
 * body, never the request URL, so the backend's logs don't carry them.
 */
import type { Attribution } from "@/lib/funnel/attribution";
import type { WebSignupAnswer, WebSignupSettings, WebSignupUser } from "@/lib/funnel/webSignupProfile";
import { parseTargets, type Targets } from "./quiz";

export class LeadApiError extends Error {
  constructor(readonly status: number) {
    super(`PrepIt API ${status}`);
    this.name = "LeadApiError";
  }
}

function apiBase(): string | null {
  const base = process.env.NEXT_PUBLIC_PREPIT_API_BASE_URL?.trim();
  return base ? base.replace(/\/+$/, "") : null;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const base = apiBase();
  if (!base) throw new LeadApiError(0);
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new LeadApiError(0);
  }
  if (!response.ok) throw new LeadApiError(response.status);
  return (await response.json()) as T;
}

export async function fetchTargets(request: Record<string, unknown>): Promise<Targets | null> {
  return parseTargets(await post<unknown>("/onboarding/calculate-nutritional-goals", request));
}

export type LeadInput = {
  webSessionId: string;
  email: string;
  marketingConsent: boolean;
  consentText: string;
  country: string;
  funnelId: string;
  funnelVersion: string;
  answers: WebSignupAnswer[];
  user: WebSignupUser;
  settings: WebSignupSettings;
  attribution?: Attribution | null;
};

/** Saves (or updates, by session id) the email gate's lead. */
export async function saveLead(input: LeadInput): Promise<void> {
  const { attribution, ...rest } = input;
  const strip = <T extends object>(value: T) =>
    Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)));
  await post("/web-leads", {
    ...rest,
    user: strip(input.user),
    settings: strip(input.settings),
    ...(attribution && Object.keys(attribution).length > 0 ? { attribution } : {}),
  });
}

/** What the "copy of your plan" email's page shows. */
export type LeadPlan = {
  firstName?: string | null;
  funnelId?: string | null;
  plan: {
    nutritionalGoals?: { calories?: number; protein?: number; carbs?: number; fats?: number };
    maintenanceCalories?: number;
    effectiveGoalSpeed?: number;
    resolvedGoalSpeed?: number;
  } | null;
  user?: { weight?: number; height?: number; gender?: string; age?: number } | null;
  settings?: {
    goal?: string;
    goalWeight?: number;
    goalSpeed?: number;
    unit?: "metric" | "imperial";
    diet?: string;
    intolerances?: string[];
  } | null;
};

/** The plan behind an email link; LeadApiError 404 when the link is unknown or expired. */
export function fetchLeadPlan(token: string): Promise<LeadPlan> {
  return post<LeadPlan>("/web-leads/plan", { token });
}

export async function unsubscribeLead(token: string): Promise<void> {
  await post("/web-leads/unsubscribe", { token });
}

export async function deleteLead(token: string): Promise<void> {
  await post("/web-leads/delete", { token });
}
