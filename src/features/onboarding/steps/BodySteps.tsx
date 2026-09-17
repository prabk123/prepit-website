"use client";

import PrepItIcon, { type PrepItIconName } from "@/components/shareable/PrepItIcon";
import {
  cmToFeetInches,
  feetInchesToCm,
  kgToLb,
  LB_PER_KG,
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

function formatPaceValue(paceKg: number, imperial: boolean): string {
  const value = imperial ? paceKg * LB_PER_KG : paceKg;
  const unit = imperial ? "lb" : "kg";
  const rounded = Number(value.toFixed(2));
  const decimals = Number.isInteger(rounded) ? 0 : 2;
  return `${rounded.toFixed(decimals)} ${unit}`;
}

function formatChangeValue(changeKg: number, imperial: boolean): string {
  const value = imperial ? kgToLb(changeKg) : changeKg;
  return value.toFixed(0);
}

function projectedGoalDate(changeKg: number, paceKg: number): Date | null {
  if (paceKg <= 0 || changeKg <= 0) return null;
  const date = new Date();
  date.setDate(date.getDate() + Math.round((changeKg / paceKg) * 7));
  return date;
}

function WhyPaceRow({ icon, text }: { icon: PrepItIconName; text: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="ai-icon-chrome" aria-hidden>
        <div className="ai-icon-chrome__inner">
          <PrepItIcon name={icon} size={20} color="var(--text-primary)" />
        </div>
      </div>
      <p className="min-w-0 flex-1 text-base leading-[1.5] text-[var(--text-primary)]">
        {text}
      </p>
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
  const unitLabel = imperial ? "lb" : "kg";
  const changeAbs = Math.abs(state.goalWeight - state.weight);
  const goalDate = projectedGoalDate(changeAbs, pace);
  const dateLabel = goalDate
    ? goalDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepCopy title="We've set your pace" />
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">
        <p className="text-center text-[28px] font-bold leading-none">
          {formatPaceValue(pace, imperial)}
        </p>
        <p className="mt-2 text-center text-base text-[var(--text-secondary)]">
          per week
        </p>
        {dateLabel ? (
          <p className="mt-6 rounded-2xl bg-[var(--input-fill)] px-4 py-4 text-center text-base">
            You should {losing ? "lose" : "gain"} {formatChangeValue(changeAbs, imperial)}{" "}
            {unitLabel} by {dateLabel}
          </p>
        ) : null}
        <p className="mt-6 text-center text-base leading-[1.5] text-[var(--text-secondary)]">
          This isn&apos;t a miracle plan — it&apos;s one you can actually stick to.
          Consistency gets you there.
        </p>
        <div className="mt-4">
          <p className="text-lg font-bold">Why this pace?</p>
          <div className="mt-2">
            <WhyPaceRow
              icon="protein"
              text={
                losing
                  ? "Protects your muscle — rapid loss burns muscle, not just fat"
                  : "Builds lean muscle — gaining faster mostly adds fat"
              }
            />
            <WhyPaceRow
              icon="restaurant"
              text="Fits real life — no crash dieting, no constant hunger"
            />
            <WhyPaceRow
              icon="charts"
              text={
                losing
                  ? "Lasts — weight lost slowly is far more likely to stay off"
                  : "Lasts — steady gains you can keep building on"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
