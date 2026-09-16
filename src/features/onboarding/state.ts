"use client";

import { defaultUnitFromLocale } from "@/features/onboarding/mappings";

export type OnboardingState = {
  name: string | null;
  gender: string | null;
  dailyActivity: string | null;
  exerciseFrequency: string | null;
  unit: "Metric" | "Imperial";
  height: number;
  weight: number;
  dob: string;
  goal: string | null;
  goalWeight: number;
  goalSpeed: number;
  mainBlocker: string[];
  diet: string | null;
  intolerances: string[];
};

const STORAGE_KEY = "prepit_onboarding_state_v1";
const STEP_STORAGE_KEY = "prepit_onboarding_step_v1";

export function defaultOnboardingState(): OnboardingState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    name: null,
    gender: null,
    dailyActivity: null,
    exerciseFrequency: null,
    unit: defaultUnitFromLocale(),
    height: 170,
    weight: 70,
    dob: today,
    goal: null,
    goalWeight: 70,
    goalSpeed: 0.5,
    mainBlocker: [],
    diet: null,
    intolerances: [],
  };
}

export function loadOnboardingState(): OnboardingState {
  if (typeof window === "undefined") return defaultOnboardingState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultOnboardingState();
    return { ...defaultOnboardingState(), ...JSON.parse(raw) };
  } catch {
    return defaultOnboardingState();
  }
}

export function saveOnboardingState(state: OnboardingState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadOnboardingStepId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STEP_STORAGE_KEY);
}

export function saveOnboardingStepId(stepId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STEP_STORAGE_KEY, stepId);
}

export function clearOnboardingPersistence() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(STEP_STORAGE_KEY);
}

export function patchOnboardingState(
  state: OnboardingState,
  patch: Partial<OnboardingState>,
): OnboardingState {
  const next = { ...state, ...patch };
  saveOnboardingState(next);
  return next;
}
