"use client";

import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLb,
  lbToKg,
  recommendedGoalSpeed,
} from "@/features/onboarding/mappings";
import type { OnboardingState } from "@/features/onboarding/state";
import DateWheelPicker from "@/features/onboarding/components/DateWheelPicker";
import StepCopy from "@/features/onboarding/components/StepCopy";
import UnitToggle from "@/features/onboarding/components/UnitToggle";
import WeightRulerPicker from "@/features/onboarding/components/WeightRulerPicker";
import WheelPicker from "@/features/onboarding/components/WheelPicker";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function HeightWeightStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  const imperial = state.unit === "Imperial";
  const { feet, inches } = cmToFeetInches(state.height);
  const displayWeight = imperial ? kgToLb(state.weight) : state.weight;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepCopy
        title="Your height and weight"
        subtitle="This will be used to create a personalised plan."
      />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <UnitToggle value={state.unit} onChange={(unit) => onChange({ unit })} />
        <div className="mt-10 flex w-full items-start justify-center gap-4">
          <div className="flex flex-1 flex-col items-center">
            <p className="mb-4 text-base font-bold">Height</p>
            {imperial ? (
              <div className="flex items-center gap-2">
                <WheelPicker
                  value={feet}
                  values={range(3, 8)}
                  format={(value) => `${value} ft`}
                  onChange={(next) => onChange({ height: feetInchesToCm(next, inches) })}
                  width={72}
                />
                <WheelPicker
                  value={inches}
                  values={range(0, 11)}
                  format={(value) => `${value} in`}
                  onChange={(next) => onChange({ height: feetInchesToCm(feet, next) })}
                  width={72}
                />
              </div>
            ) : (
              <WheelPicker
                value={state.height}
                values={range(120, 220)}
                format={(value) => `${value} cm`}
                onChange={(height) => onChange({ height })}
                width={96}
              />
            )}
          </div>
          <div className="flex flex-1 flex-col items-center">
            <p className="mb-4 text-base font-bold">Weight</p>
            <WheelPicker
              value={displayWeight}
              values={range(imperial ? 80 : 35, imperial ? 400 : 180)}
              format={(value) => `${value} ${imperial ? "lb" : "kg"}`}
              onChange={(next) => {
                const kg = imperial ? lbToKg(next) : next;
                onChange({ weight: kg, goalWeight: kg });
              }}
              width={96}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgeStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepCopy
        title="When were you born?"
        subtitle="This will be used to create a personalised plan."
      />
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <DateWheelPicker value={state.dob} onChange={(dob) => onChange({ dob })} />
      </div>
    </div>
  );
}

export function GoalWeightStep({
  state,
  onChange,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
}) {
  const imperial = state.unit === "Imperial";
  const displayGoal = imperial ? kgToLb(state.goalWeight) : state.goalWeight;
  const displayCurrent = imperial ? kgToLb(state.weight) : state.weight;
  const delta = Number((displayGoal - displayCurrent).toFixed(1));
  const unitLabel = imperial ? "lb" : "kg";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepCopy
        title="What's your goal weight?"
        subtitle="This will be used to create a personalised plan."
      />
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="mb-4 text-center">
          <p className="text-[40px] font-black leading-none">
            {displayGoal.toFixed(1)} {unitLabel}
          </p>
        </div>
        <WeightRulerPicker
          value={displayGoal}
          min={imperial ? 80 : 35}
          max={imperial ? 400 : 180}
          unit={unitLabel}
          onChange={(next) => {
            const kg = imperial ? lbToKg(next) : next;
            const patch: Partial<OnboardingState> = { goalWeight: kg };
            if (kg < state.weight && state.goal !== "Lose fat") {
              patch.goal = "Lose fat";
            } else if (kg > state.weight && state.goal !== "Build muscle") {
              patch.goal = "Build muscle";
            }
            onChange(patch);
          }}
        />
        <p className="mt-8 text-center text-[28px] font-black text-[#FF644F]">
          {delta === 0
            ? `0.0 ${unitLabel}`
            : `${delta > 0 ? "+" : "-"} ${Math.abs(delta).toFixed(1)} ${unitLabel}`}
        </p>
      </div>
    </div>
  );
}

export function GoalSpeedStep({
  state,
}: {
  state: OnboardingState;
}) {
  const pace = recommendedGoalSpeed(state.weight, state.goalWeight);
  const losing = state.goalWeight < state.weight;
  const imperial = state.unit === "Imperial";
  const paceDisplay = imperial ? (pace * 2.20462).toFixed(2) : pace.toFixed(2);
  const changeAbs = Math.abs(state.goalWeight - state.weight);
  const weeks = pace > 0 && changeAbs > 0 ? changeAbs / pace : 0;
  const date =
    weeks > 0
      ? new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
          undefined,
          { month: "long", year: "numeric" },
        )
      : null;
  const displayChange = imperial ? kgToLb(changeAbs) : changeAbs;

  return (
    <div>
      <StepCopy title="We've set your pace" />
      <p className="text-4xl font-semibold">
        {paceDisplay} {imperial ? "lb" : "kg"}
        <span className="ml-2 text-lg font-medium text-[var(--text-secondary)]">per week</span>
      </p>
      {date ? (
        <p className="mt-3 text-base">
          You should {losing ? "lose" : "gain"} {displayChange}{" "}
          {imperial ? "lb" : "kg"} by {date}
        </p>
      ) : null}
      <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
        This isn&apos;t a miracle plan — it&apos;s one you can actually stick to.
        Consistency gets you there.
      </p>
      <div className="mt-6 rounded-2xl bg-[var(--input-fill)] p-4">
        <p className="font-semibold">Why this pace?</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
          {losing
            ? "A sustainable fat-loss pace protects muscle and fits real life."
            : "A measured gain pace supports lean mass without unnecessary surplus."}{" "}
          Fits real life, not a crash week.
        </p>
      </div>
    </div>
  );
}
