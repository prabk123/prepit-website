import {
  GOALS_WITHOUT_WEIGHT_TARGET,
} from "@/features/onboarding/mappings";
import type { OnboardingState } from "@/features/onboarding/state";

export const WEB_STEPS = [
  "getStarted",
  "goal",
  "mainBlocker",
  "recallIntro",
  "accurateLoggingIntro",
  "gender",
  "heightWeight",
  "age",
  "goalWeight",
  "goalSpeed",
  "dailyMovement",
  "exercise",
  "weeklyCheckInIntro",
  "diet",
  "intolerances",
  "nutritionSignalsIntro",
  "chatPreview",
  "mealPlanIntro",
  "complete",
  "login",
] as const;

export type WebStepId = (typeof WEB_STEPS)[number];

export const DEMO_STEPS = new Set<WebStepId>([
  "recallIntro",
  "weeklyCheckInIntro",
  "chatPreview",
  "mealPlanIntro",
]);

export const CENTERED_STEPS = new Set<WebStepId>([
  "heightWeight",
  "age",
  "goalWeight",
  "complete",
  "login",
]);

export function shouldSkipGoalWeight(state: OnboardingState): boolean {
  return Boolean(state.goal && GOALS_WITHOUT_WEIGHT_TARGET.has(state.goal));
}

export function shouldSkipGoalSpeed(state: OnboardingState): boolean {
  return shouldSkipGoalWeight(state) || state.weight === state.goalWeight;
}

export function nextStepId(current: WebStepId, state: OnboardingState): WebStepId | null {
  let index = WEB_STEPS.indexOf(current) + 1;
  while (index < WEB_STEPS.length) {
    const candidate = WEB_STEPS[index];
    if (candidate === "goalWeight" && shouldSkipGoalWeight(state)) {
      index += 1;
      continue;
    }
    if (candidate === "goalSpeed" && shouldSkipGoalSpeed(state)) {
      index += 1;
      continue;
    }
    return candidate;
  }
  return null;
}

export function previousStepId(
  current: WebStepId,
  state: OnboardingState,
): WebStepId | null {
  let index = WEB_STEPS.indexOf(current) - 1;
  while (index >= 0) {
    const candidate = WEB_STEPS[index];
    if (candidate === "goalSpeed" && shouldSkipGoalSpeed(state)) {
      index -= 1;
      continue;
    }
    if (candidate === "goalWeight" && shouldSkipGoalWeight(state)) {
      index -= 1;
      continue;
    }
    return candidate;
  }
  return null;
}

export function visibleStepIndex(current: WebStepId, state: OnboardingState): number {
  if (current === "getStarted") return 0;
  let count = 0;
  for (const step of WEB_STEPS) {
    if (step === "getStarted") continue;
    if (step === "goalWeight" && shouldSkipGoalWeight(state)) continue;
    if (step === "goalSpeed" && shouldSkipGoalSpeed(state)) continue;
    if (step === current) return count;
    count += 1;
  }
  return count;
}

export function visibleStepCount(state: OnboardingState): number {
  return WEB_STEPS.filter((step) => {
    if (step === "getStarted") return false;
    if (step === "goalWeight" && shouldSkipGoalWeight(state)) return false;
    if (step === "goalSpeed" && shouldSkipGoalSpeed(state)) return false;
    return true;
  }).length;
}

export function canContinue(step: WebStepId, state: OnboardingState): boolean {
  switch (step) {
    case "goal":
      return Boolean(state.goal);
    case "mainBlocker":
      return state.mainBlocker.length > 0;
    case "gender":
      return Boolean(state.gender);
    case "dailyMovement":
      return Boolean(state.dailyActivity);
    case "exercise":
      return Boolean(state.exerciseFrequency);
    case "diet":
      return Boolean(state.diet);
    default:
      return true;
  }
}

export function continueLabel(step: WebStepId): string {
  if (step === "getStarted") return "Get Started";
  if (step === "complete") return "Save my plan";
  return "Continue";
}

export function stepCompleteValue(step: WebStepId, state: OnboardingState): string | undefined {
  switch (step) {
    case "goal":
      return state.goal ?? undefined;
    case "mainBlocker":
      return state.mainBlocker.join(",");
    case "gender":
      return state.gender ?? undefined;
    case "heightWeight":
      return `${state.height}cm, ${state.weight}kg`;
    case "age":
      return state.dob;
    case "goalWeight":
      return String(state.goalWeight);
    case "goalSpeed":
      return String(state.goalSpeed);
    case "dailyMovement":
      return state.dailyActivity ?? undefined;
    case "exercise":
      return state.exerciseFrequency ?? undefined;
    case "diet":
      return state.diet ?? undefined;
    case "intolerances":
      return state.intolerances.join(",");
    default:
      return undefined;
  }
}
