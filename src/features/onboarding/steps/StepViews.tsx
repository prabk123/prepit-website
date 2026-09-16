"use client";

import NlLogFlowPhoneDemo from "@/components/NlLogFlowPhoneDemo";
import AiChatPhoneDemo from "@/components/AiChatPhoneDemo";
import { AI_COACH_DEMO_SCENARIOS } from "@/components/aiCoachDemoData";
import MealPlanIntroDemo from "@/features/onboarding/components/MealPlanIntroDemo";
import MealReviewCard from "@/features/onboarding/components/MealReviewCard";
import SelectItem from "@/features/onboarding/components/SelectItem";
import SpinningAiGlow from "@/features/onboarding/components/SpinningAiGlow";
import WeeklyCheckInDemo from "@/features/onboarding/components/WeeklyCheckInDemo";
import NutritionSignalsIntro from "@/features/onboarding/components/NutritionSignalsIntro";
import StepCopy from "@/features/onboarding/components/StepCopy";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import {
  BLOCKER_OPTIONS,
  DAILY_ACTIVITY_OPTIONS,
  DIET_OPTIONS,
  EXERCISE_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  INTOLERANCE_OPTIONS,
} from "@/features/onboarding/mappings";
import type { OnboardingState } from "@/features/onboarding/state";

export function GoalStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <StepCopy
        title="What do you want help with first?"
        subtitle="Choose the main goal PrepIt should optimise for. You can change this later."
      />
      <div className="flex flex-col gap-2">
        {GOAL_OPTIONS.map((option) => (
          <SelectItem
            key={option.displayLabel}
            label={option.displayLabel}
            description={option.description}
            selected={state.goal === option.displayLabel}
            onTap={() =>
              onChange({
                goal: option.displayLabel,
                ...(new Set(["Maintain", "Improve energy", "Stay fuller", "Eat healthier"]).has(
                  option.displayLabel,
                )
                  ? { goalWeight: state.weight }
                  : {}),
              })
            }
          />
        ))}
      </div>
    </div>
  );
}

export function BlockerStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <StepCopy
        title="What usually gets in the way?"
        subtitle="This helps PrepIt give advice that actually fits your life."
      />
      <div className="flex flex-col gap-2">
        {BLOCKER_OPTIONS.map((option) => {
          const selected = state.mainBlocker.includes(option);
          return (
            <SelectItem
              key={option}
              label={option}
              selected={selected}
              onTap={() =>
                onChange({
                  mainBlocker: selected
                    ? state.mainBlocker.filter((item) => item !== option)
                    : [...state.mainBlocker, option],
                })
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export function RecallIntroStep({
  onDemoProgress,
}: {
  onDemoProgress?: (progress: number) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepCopy title="PrepIt makes tracking your meals seamless" />
      <div className="min-h-0 flex-1">
        <NlLogFlowPhoneDemo fit onProgressChanged={onDemoProgress} />
      </div>
    </div>
  );
}

function FeatureRow({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: "search" | "checkmark";
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="ai-icon-chrome" aria-hidden>
        <div className="ai-icon-chrome__inner">
          <PrepItIcon name={icon} size={20} color="var(--black-100)" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-[1.35] text-[var(--black-100)] min-[700px]:text-base">
          {title}
        </p>
        <p className="mt-1 text-[13px] leading-[1.5] text-[var(--grey-60)] min-[700px]:mt-1.5 min-[700px]:text-sm">
          {body}
        </p>
      </div>
    </div>
  );
}

export function AccurateLoggingStep() {
  return (
    <div className="pb-4">
      <StepCopy compact title="The most accurate logging.. naturally" />
      <div className="flex flex-col gap-4 min-[700px]:gap-5">
        <FeatureRow
          title="PrepIt does the research"
          body="PrepIt compiles all of the legitimate sources and cross-references them"
          icon="search"
        />
        <FeatureRow
          title="Review and confirm"
          body="You review it. Nothing's logged before you confirm you're happy"
          icon="checkmark"
        />
      </div>
      <div className="mt-5 px-1 min-[700px]:mt-7">
        <SpinningAiGlow>
          <MealReviewCard />
        </SpinningAiGlow>
      </div>
    </div>
  );
}

export function GenderStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <StepCopy
        title="👋 Tell us about you"
        subtitle="This will be used to create a personalised plan."
      />
      <p className="mb-3 text-sm font-semibold">Your gender</p>
      <div className="flex flex-col gap-2">
        {GENDER_OPTIONS.map((option) => (
          <SelectItem
            key={option}
            label={option}
            selected={state.gender === option}
            onTap={() => onChange({ gender: option })}
          />
        ))}
      </div>
    </div>
  );
}

export function DailyMovementStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <StepCopy
        title="How active is your typical day?"
        subtitle="Think about your job and everyday movement outside of exercise on a typical week."
      />
      <div className="flex flex-col gap-2">
        {DAILY_ACTIVITY_OPTIONS.map((option) => (
          <SelectItem
            key={option.backendValue}
            label={option.label}
            description={option.description}
            selected={state.dailyActivity === option.backendValue}
            onTap={() => onChange({ dailyActivity: option.backendValue })}
          />
        ))}
      </div>
    </div>
  );
}

export function ExerciseStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <StepCopy
        title="How often do you exercise?"
        subtitle="Structured workouts like gym sessions, runs, or classes."
      />
      <div className="flex flex-col gap-2">
        {EXERCISE_OPTIONS.map((option) => (
          <SelectItem
            key={option.backendValue}
            label={option.label}
            description={option.description}
            selected={state.exerciseFrequency === option.backendValue}
            onTap={() => onChange({ exerciseFrequency: option.backendValue })}
          />
        ))}
      </div>
    </div>
  );
}

export function WeeklyCheckInStep({
  onDemoProgress,
}: {
  onDemoProgress?: (progress: number) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepCopy
        compact
        title="Weekly reviews to keep you on track and plan your next steps."
        subtitle="See how your habits are evolving and get one clear focus for the week ahead."
      />
      <div className="min-h-0 flex-1">
        <WeeklyCheckInDemo onProgressChanged={onDemoProgress} />
      </div>
    </div>
  );
}

export function DietStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <StepCopy title="Do you follow a specific diet?" />
      <div className="flex flex-col gap-2">
        {DIET_OPTIONS.map((option) => (
          <SelectItem
            key={option}
            label={option}
            selected={state.diet === option}
            onTap={() => onChange({ diet: option })}
          />
        ))}
      </div>
    </div>
  );
}

export function IntolerancesStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div>
      <StepCopy
        title="Do you have any food allergies or intolerances?"
        subtitle="This will be used to create a personalised plan. Select all that apply."
      />
      <div className="flex flex-wrap gap-2">
        {INTOLERANCE_OPTIONS.map((option) => {
          const selected = state.intolerances.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() =>
                onChange({
                  intolerances: selected
                    ? state.intolerances.filter((item) => item !== option)
                    : [...state.intolerances, option],
                })
              }
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                selected
                  ? "border-[var(--primary)] bg-[var(--border)] text-[var(--text-primary)]"
                  : "border-[var(--text-tertiary)] bg-[var(--surface)] text-[var(--text-primary)]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function NutritionSignalsStep() {
  return <NutritionSignalsIntro />;
}

export function ChatPreviewStep({
  onDemoProgress,
}: {
  onDemoProgress?: (progress: number) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepCopy
        title="Ask your nutritionist anything, anytime. 24/7."
        subtitle="Get actionable answers based on your food log, your goals, and your patterns."
      />
      <div className="min-h-0 flex-1">
        <AiChatPhoneDemo
          fit
          scenarios={AI_COACH_DEMO_SCENARIOS}
          onProgressChanged={onDemoProgress}
        />
      </div>
    </div>
  );
}

export function MealPlanIntroStep({
  onDemoProgress,
}: {
  onDemoProgress?: (progress: number) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <StepCopy
        compact
        title="Your nutritionist plans your week. You just confirm."
        subtitle="Meals that fit your targets, your diet, and how you actually eat. Swap anything — nothing is set until you say so."
      />
      <div className="min-h-0 flex-1">
        <MealPlanIntroDemo onProgressChanged={onDemoProgress} />
      </div>
    </div>
  );
}
