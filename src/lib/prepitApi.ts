"use client";

import { getIdToken } from "@/lib/firebase";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export type NutritionalGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type CalculateGoalsResponse = {
  nutritionalGoals: NutritionalGoals;
  maintenanceCalories?: number;
  effectiveGoalSpeed?: number;
  resolvedGoalSpeed?: number;
};

export type AccountResponse = {
  account: {
    user?: { email?: string; firstName?: string; subscriptionStatus?: string };
    settings?: Record<string, unknown> | null;
    hasUsedTrial?: boolean;
  } | null;
};

export type CreateAccountPayload = {
  user: {
    firstName: string;
    lastName?: string;
    email: string;
    dob: string;
    gender: string;
    height: number;
    weight: number;
  };
  settings: {
    goal: string;
    goalWeight: number;
    goalSpeed?: number;
    dailyActivity: string;
    exerciseFrequency: string;
    diet: string;
    intolerances: string[];
    mainBlocker?: string[];
  };
  signupSource?: "app" | "web";
};

async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("x-client-platform", "web");
  if (options.auth) {
    const token = await getIdToken();
    if (!token) throw new Error("Not signed in");
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export function calculateNutritionalGoals(body: {
  dob: string;
  gender: string;
  height: number;
  weight: number;
  dailyActivity: string;
  exerciseFrequency: string;
  goalSpeed: number;
  goal: string;
  goalWeight: number;
}): Promise<CalculateGoalsResponse> {
  return apiFetch("/onboarding/calculate-nutritional-goals", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getAccount(): Promise<AccountResponse> {
  return apiFetch("/account", { method: "GET", auth: true });
}

export function createAccount(
  payload: CreateAccountPayload,
): Promise<AccountResponse> {
  return apiFetch("/account", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}
