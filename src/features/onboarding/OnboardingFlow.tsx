"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DemoProgressDivider from "@/features/onboarding/components/DemoProgressDivider";
import FunnelHeader from "@/features/onboarding/components/FunnelHeader";
import {
  canContinue,
  CENTERED_STEPS,
  continueLabel,
  DEMO_STEPS,
  nextStepId,
  previousStepId,
  stepCompleteValue,
  visibleStepCount,
  visibleStepIndex,
  WEB_STEPS,
  type WebStepId,
} from "@/features/onboarding/steps";
import { recommendedGoalSpeed } from "@/features/onboarding/mappings";
import { getGoalBackendValue } from "@/features/onboarding/mappings";
import {
  loadOnboardingState,
  loadOnboardingStepId,
  patchOnboardingState,
  saveOnboardingStepId,
  type OnboardingState,
} from "@/features/onboarding/state";
import {
  trackOnboardingStart,
  trackOnboardingStepComplete,
  trackOnboardingStepView,
  trackAuthSignupView,
} from "@/lib/funnelAnalytics";
import { calculateNutritionalGoals, type NutritionalGoals } from "@/lib/prepitApi";
import {
  AccurateLoggingStep,
  BlockerStep,
  ChatPreviewStep,
  DailyMovementStep,
  DietStep,
  ExerciseStep,
  GenderStep,
  GoalStep,
  IntolerancesStep,
  MealPlanIntroStep,
  NutritionSignalsStep,
  RecallIntroStep,
  WeeklyCheckInStep,
} from "@/features/onboarding/steps/StepViews";
import {
  AgeStep,
  GoalSpeedStep,
  GoalWeightStep,
  HeightWeightStep,
} from "@/features/onboarding/steps/BodySteps";
import GetStartedPrimer from "@/features/onboarding/components/GetStartedPrimer";
import CompleteStep from "@/features/onboarding/steps/CompleteStep";
import LoginStep from "@/features/onboarding/steps/LoginStep";

export default function OnboardingFlow() {
  const [state, setState] = useState<OnboardingState>(() => loadOnboardingState());
  const [step, setStep] = useState<WebStepId>("getStarted");
  const [hydrated, setHydrated] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [goals, setGoals] = useState<NutritionalGoals | null>(null);
  const [effectiveGoalSpeed, setEffectiveGoalSpeed] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [demoProgress, setDemoProgress] = useState(0);
  const demoProgressRef = useRef(0);
  const demoProgressFrame = useRef(false);

  const onDemoProgress = useCallback((progress: number) => {
    if (demoProgressRef.current === progress) return;
    demoProgressRef.current = progress;
    if (demoProgressFrame.current) return;
    demoProgressFrame.current = true;
    requestAnimationFrame(() => {
      demoProgressFrame.current = false;
      setDemoProgress(demoProgressRef.current);
    });
  }, []);

  useEffect(() => {
    demoProgressRef.current = 0;
    setDemoProgress(0);
  }, [step]);

  useEffect(() => {
    const restored = loadOnboardingState();
    const savedStep = loadOnboardingStepId();
    setState(restored);
    if (savedStep && (WEB_STEPS as readonly string[]).includes(savedStep)) {
      setStep(savedStep as WebStepId);
    }
    setHydrated(true);
    trackOnboardingStart();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    trackOnboardingStepView(step);
    if (step === "login") trackAuthSignupView();
    saveOnboardingStepId(step);
    if (step === "goalSpeed") {
      update({ goalSpeed: recommendedGoalSpeed(state.weight, state.goalWeight) });
    }
    if (step === "complete") setIsSimulating(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, step]);

  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((current) => patchOnboardingState(current, patch));
  }, []);

  const total = visibleStepCount(state);
  const index = visibleStepIndex(step, state);
  const showProgress = step !== "complete" && step !== "login";

  const goNext = useCallback(async () => {
    setError(null);
    if (step === "intolerances") {
      if (!state.gender || !state.goal || !state.dailyActivity || !state.exerciseFrequency) {
        setError("Please complete the earlier steps first.");
        return;
      }
      setCalculating(true);
      try {
        const result = await calculateNutritionalGoals({
          dob: new Date(state.dob).toISOString(),
          gender: state.gender.toLowerCase(),
          height: state.height,
          weight: state.weight,
          dailyActivity: state.dailyActivity,
          exerciseFrequency: state.exerciseFrequency,
          goalSpeed: recommendedGoalSpeed(state.weight, state.goalWeight),
          goal: getGoalBackendValue(state.goal),
          goalWeight: state.goalWeight,
        });
        setGoals(result.nutritionalGoals);
        setEffectiveGoalSpeed(result.effectiveGoalSpeed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not calculate your plan.");
        setCalculating(false);
        return;
      }
      setCalculating(false);
    }
    trackOnboardingStepComplete(step, stepCompleteValue(step, state));
    const next = nextStepId(step, state);
    if (next) setStep(next);
  }, [state, step]);

  const goBack = useCallback(() => {
    const prev = previousStepId(step, state);
    if (prev) setStep(prev);
  }, [state, step]);

  const body = useMemo(() => {
    switch (step) {
      case "getStarted":
        return null;
      case "goal":
        return <GoalStep state={state} onChange={update} />;
      case "mainBlocker":
        return <BlockerStep state={state} onChange={update} />;
      case "recallIntro":
        return <RecallIntroStep onDemoProgress={onDemoProgress} />;
      case "accurateLoggingIntro":
        return <AccurateLoggingStep />;
      case "gender":
        return <GenderStep state={state} onChange={update} />;
      case "heightWeight":
        return <HeightWeightStep state={state} onChange={update} />;
      case "age":
        return <AgeStep state={state} onChange={update} />;
      case "goalWeight":
        return <GoalWeightStep state={state} onChange={update} />;
      case "goalSpeed":
        return <GoalSpeedStep state={state} />;
      case "dailyMovement":
        return <DailyMovementStep state={state} onChange={update} />;
      case "exercise":
        return <ExerciseStep state={state} onChange={update} />;
      case "weeklyCheckInIntro":
        return <WeeklyCheckInStep onDemoProgress={onDemoProgress} />;
      case "diet":
        return <DietStep state={state} onChange={update} />;
      case "intolerances":
        return <IntolerancesStep state={state} onChange={update} />;
      case "nutritionSignalsIntro":
        return <NutritionSignalsStep />;
      case "chatPreview":
        return <ChatPreviewStep onDemoProgress={onDemoProgress} />;
      case "mealPlanIntro":
        return <MealPlanIntroStep onDemoProgress={onDemoProgress} />;
      case "complete":
        return (
          <CompleteStep
            state={state}
            goals={goals}
            effectiveGoalSpeed={effectiveGoalSpeed}
            isSimulating={isSimulating}
            onSimulatingEnded={() => setIsSimulating(false)}
          />
        );
      case "login":
        return (
          <LoginStep
            state={state}
            onNameCaptured={(name) => update({ name })}
          />
        );
    }
  }, [effectiveGoalSpeed, goals, isSimulating, onDemoProgress, state, step, update]);

  if (!hydrated) {
    return <div className="min-h-screen bg-[var(--funnel-bg)]" />;
  }

  if (step === "getStarted") {
    return <GetStartedPrimer onGetStarted={() => void goNext()} />;
  }

  const fillViewport =
    DEMO_STEPS.has(step) ||
    (CENTERED_STEPS.has(step) && (step !== "complete" || isSimulating));

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--funnel-bg)] text-[var(--text-primary)]">
      <FunnelHeader
        progress={(index + 1) / total}
        showProgress={showProgress}
        onBack={previousStepId(step, state) ? goBack : undefined}
      />
      <main className="mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col overflow-hidden px-4 pt-4">
        <div
          className={`flex min-h-0 flex-1 flex-col ${
            fillViewport ? "overflow-hidden" : "overflow-y-auto"
          }`}
        >
          {body}
        </div>
      </main>
      {step !== "login" ? (
        <div className="shrink-0 bg-[var(--funnel-bg)]">
          {DEMO_STEPS.has(step) ? (
            <DemoProgressDivider progress={demoProgress} />
          ) : (
            <div className="h-px bg-[var(--border)]" />
          )}
          <div className="mx-auto max-w-lg px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            {error ? <p className="mb-2 text-sm text-[var(--coral-100)]">{error}</p> : null}
            <button
              type="button"
              disabled={!canContinue(step, state) || calculating || (step === "complete" && isSimulating)}
              onClick={() => void goNext()}
              className="h-12 w-full rounded-2xl bg-[var(--primary)] text-base font-bold text-[var(--on-primary)] disabled:opacity-50 sm:h-14"
            >
              {calculating ? "Calculating..." : continueLabel(step)}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
