import { splitDisplayName } from "@/lib/firebase";
import { createAccount, getAccount } from "@/lib/prepitApi";
import { getGoalBackendValue } from "@/features/onboarding/mappings";
import { loadOnboardingState } from "@/features/onboarding/state";
import type { User } from "firebase/auth";

export function onboardingStateIsComplete(): boolean {
  const state = loadOnboardingState();
  return Boolean(
    state.goal &&
      state.gender &&
      state.diet &&
      state.dailyActivity &&
      state.exerciseFrequency,
  );
}

export type AccountEnsureResult = "existing" | "created" | "incomplete";

export async function createAccountFromSavedState(
  user: User,
): Promise<AccountEnsureResult> {
  const existing = await getAccount();
  if (existing.account?.settings) return "existing";
  const state = loadOnboardingState();
  if (!onboardingStateIsComplete()) return "incomplete";
  const { firstName, lastName } = splitDisplayName(user.displayName ?? state.name);
  const email = user.email;
  if (!email) throw new Error("Your account needs an email address to continue.");
  await createAccount({
    user: {
      firstName,
      lastName,
      email,
      dob: new Date(state.dob).toISOString(),
      gender: state.gender!.toLowerCase(),
      height: state.height,
      weight: state.weight,
    },
    settings: {
      goal: getGoalBackendValue(state.goal!),
      goalWeight: state.goalWeight,
      goalSpeed: state.goalSpeed,
      dailyActivity: state.dailyActivity!,
      exerciseFrequency: state.exerciseFrequency!,
      diet: state.diet!.toLowerCase(),
      intolerances: state.intolerances,
      ...(state.mainBlocker.length > 0 ? { mainBlocker: state.mainBlocker } : {}),
    },
    signupSource: "web",
  });
  return "created";
}
