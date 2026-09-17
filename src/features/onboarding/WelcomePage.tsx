"use client";

import { useEffect, useState } from "react";
import AppStoreLink from "@/components/AppStoreLink";
import AppStoreQr from "@/components/AppStoreQr";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import FunnelHeader from "@/features/onboarding/components/FunnelHeader";
import {
  getGoalBackendValue,
  getGoalDisplayLabel,
} from "@/features/onboarding/mappings";
import {
  defaultOnboardingState,
  loadOnboardingState,
  type OnboardingState,
} from "@/features/onboarding/state";
import PlanSummary from "@/features/onboarding/components/PlanSummary";
import { onboardingStateIsComplete } from "@/features/onboarding/completeAccount";
import {
  consumeRedirectResult,
  persistAuthProvider,
  readPersistedAuthProvider,
  resolveAuthProvider,
  splitDisplayName,
  waitForAuthUser,
} from "@/lib/firebase";
import { APP_STORE_URL } from "@/lib/appStore";
import { identifyFunnelUser, trackWebWelcomeView } from "@/lib/funnelAnalytics";
import {
  calculateNutritionalGoals,
  getAccount,
  type NutritionalGoals,
} from "@/lib/prepitApi";

type AuthProvider = "google" | "apple";
type DeviceKind = "ios" | "android" | "desktop";

function providerLabel(provider: AuthProvider | null): string | null {
  if (provider === "apple") return "Apple";
  if (provider === "google") return "Google";
  return null;
}

function detectDevice(): DeviceKind {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function planHeadline(goal: string | null): string {
  switch (goal) {
    case "Lose fat":
      return "Your fat-loss plan is waiting in the app.";
    case "Build muscle":
      return "Your muscle-building plan is waiting in the app.";
    case "Improve energy":
      return "Your energy plan is waiting in the app.";
    case "Stay fuller":
      return "Your satiety plan is waiting in the app.";
    case "Eat healthier":
      return "Your nutrition plan is waiting in the app.";
    case "Fuel training":
      return "Your training plan is waiting in the app.";
    case "Maintain":
      return "Your maintenance plan is waiting in the app.";
    default:
      return "Your personalized plan is waiting in the app.";
  }
}

function readAccountGoals(
  settings: Record<string, unknown> | null | undefined,
): NutritionalGoals | null {
  const raw = settings?.nutritionalGoals;
  if (!raw || typeof raw !== "object") return null;
  const calories = Number((raw as { calories?: unknown }).calories);
  if (!Number.isFinite(calories) || calories <= 0) return null;
  return {
    calories,
    protein: Number((raw as { protein?: unknown }).protein) || 0,
    carbs: Number((raw as { carbs?: unknown }).carbs) || 0,
    fats: Number((raw as { fats?: unknown }).fats) || 0,
  };
}

function resolveGoalLabel(
  savedGoal: string | null,
  settings: Record<string, unknown> | null | undefined,
): string | null {
  if (savedGoal) return savedGoal;
  const backend = typeof settings?.goal === "string" ? settings.goal : null;
  return backend ? getGoalDisplayLabel(backend) : null;
}

export default function WelcomePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [provider, setProvider] = useState<AuthProvider | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [planState, setPlanState] = useState<OnboardingState>(defaultOnboardingState);
  const [goals, setGoals] = useState<NutritionalGoals | null>(null);
  const [effectiveGoalSpeed, setEffectiveGoalSpeed] = useState<number | undefined>();
  const [device, setDevice] = useState<DeviceKind | null>(null);

  useEffect(() => {
    setDevice(detectDevice());
    const saved = loadOnboardingState();
    setPlanState(saved);
    setFirstName(splitDisplayName(saved.name).firstName || null);
    trackWebWelcomeView();

    void (async () => {
      const persisted = readPersistedAuthProvider();
      if (persisted) setProvider(persisted);
      await consumeRedirectResult();
      const user = await waitForAuthUser();
      if (user) identifyFunnelUser(user.uid, { email: user.email });
      setEmail(user?.email ?? null);
      const nextProvider = resolveAuthProvider(user);
      setProvider(nextProvider);
      if (nextProvider) persistAuthProvider(nextProvider);
      const fromAuth = splitDisplayName(user?.displayName).firstName;
      if (fromAuth) setFirstName(fromAuth);

      try {
        const { account } = await getAccount();
        const settings = (account?.settings ?? null) as Record<string, unknown> | null;
        const nextGoal = resolveGoalLabel(saved.goal, settings);
        if (nextGoal && nextGoal !== saved.goal) {
          setPlanState((current) => ({ ...current, goal: nextGoal }));
        }
        const fromAccount = readAccountGoals(settings);
        if (fromAccount) {
          setGoals(fromAccount);
          return;
        }
      } catch {
        // Fall through to local calculation.
      }

      if (!onboardingStateIsComplete()) return;
      try {
        const state = loadOnboardingState();
        const result = await calculateNutritionalGoals({
          dob: new Date(state.dob).toISOString(),
          gender: state.gender!.toLowerCase(),
          height: state.height,
          weight: state.weight,
          dailyActivity: state.dailyActivity!,
          exerciseFrequency: state.exerciseFrequency!,
          goalSpeed: state.goalSpeed,
          goal: getGoalBackendValue(state.goal!),
          goalWeight: state.goalWeight,
        });
        setGoals(result.nutritionalGoals);
        setEffectiveGoalSpeed(result.effectiveGoalSpeed);
      } catch {
        // Recap still works without calorie numbers.
      }
    })();
  }, []);

  const signInWith = providerLabel(provider);
  const isAndroid = device === "android";
  const downloadSubject = "Your PrepIt download";
  const downloadBody = [
    "Download PrepIt on your iPhone:",
    APP_STORE_URL,
    "",
    signInWith
      ? `Open the app and tap Sign in with ${signInWith} — not Get Started.`
      : "Open the app and tap Sign in — not Get Started.",
  ].join("\n");

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[var(--funnel-bg)] text-[var(--text-primary)]">
      <FunnelHeader progress={1} showProgress={false} centered />
      <main className="mx-auto flex w-full min-h-0 max-w-lg flex-1 flex-col overflow-y-auto px-4 pt-2 pb-4">
        <h1 className="font-clash text-[28px] font-semibold leading-8 tracking-tight text-[var(--text-primary)]">
          You&apos;re all set{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 text-base leading-6 text-[var(--text-secondary)]">
          {planHeadline(planState.goal)}
        </p>

        <ol className="mt-6 space-y-4">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--input-fill)] text-sm font-semibold">
              1
            </span>
            <p className="pt-0.5 text-base leading-6">Download the app</p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--input-fill)] text-sm font-semibold">
              2
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-base leading-6">
                Tap <strong>Sign in</strong> — not Get Started
              </p>
              <p className="mt-2 rounded-xl border border-[#F5A623]/35 bg-[#F5A623]/15 px-3 py-2.5 text-sm leading-5 text-[#8A5A00] dark:text-[#F5CC77]">
                Get Started starts a new plan. Sign in loads the one you just saved.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--input-fill)] text-sm font-semibold">
              3
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-base leading-6">
                {signInWith
                  ? `Sign in with ${signInWith}`
                  : "Sign in with the same account you just used here"}
              </p>
              {email ? (
                <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">{email}</p>
              ) : null}
            </div>
          </li>
        </ol>

        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            Saved to your account
          </p>
          <div className="mt-3">
            <PlanSummary
              state={planState}
              goals={goals}
              effectiveGoalSpeed={effectiveGoalSpeed}
            />
          </div>
        </section>

        <section className="mt-6 hidden flex-col items-center text-center md:flex">
          <AppStoreQr />
          <p className="mt-3 text-sm font-semibold">
            {isAndroid
              ? "PrepIt is on iPhone. Scan this to open the App Store."
              : "Scan with your iPhone"}
          </p>
          {email ? (
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(downloadSubject)}&body=${encodeURIComponent(downloadBody)}`}
              className="mt-2 text-sm font-semibold underline"
            >
              Email me the download link
            </a>
          ) : null}
        </section>

        {isAndroid ? (
          <p className="mt-6 text-center text-sm leading-5 text-[var(--text-secondary)] md:hidden">
            PrepIt is available on iPhone. Email yourself the link or open the App
            Store on an iPhone.
            {email ? (
              <>
                {" "}
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(downloadSubject)}&body=${encodeURIComponent(downloadBody)}`}
                  className="font-semibold underline"
                >
                  Email me the download link
                </a>
              </>
            ) : null}
          </p>
        ) : null}

      </main>

      <div className="shrink-0 bg-[var(--funnel-bg)]">
        <div className="h-px bg-[var(--border)]" />
        <div className="mx-auto max-w-lg px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <AppStoreLink
            trackingSource="web-funnel-welcome"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] text-base font-bold text-[var(--on-primary)] sm:h-14"
          >
            <PrepItIcon name="appleLogo" size={18} color="var(--on-primary)" />
            Download PrepIt
          </AppStoreLink>
          <p className="mt-3 mb-1 text-center text-sm text-[var(--text-tertiary)]">
            Questions?{" "}
            <a href="mailto:support@tryprepit.app" className="font-medium underline">
              support@tryprepit.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
