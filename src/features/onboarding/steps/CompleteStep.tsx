"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { NutritionalGoals } from "@/lib/prepitApi";
import type { OnboardingState } from "@/features/onboarding/state";
import { kgToLb } from "@/features/onboarding/mappings";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import AiInsightCard from "@/features/onboarding/components/AiInsightCard";
import SpinningAiGlow from "@/features/onboarding/components/SpinningAiGlow";
import StepCopy from "@/features/onboarding/components/StepCopy";

const SOURCES = [
  {
    title: "Mifflin-St Jeor Equation (BMR)",
    description:
      "Mifflin et al. (1990), American Journal of Clinical Nutrition. Used to estimate your Basal Metabolic Rate based on age, sex, height, and weight.",
    url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
  },
  {
    title: "Physical Activity Level Multipliers (TDEE)",
    description:
      "Westerterp (2013), Frontiers in Physiology. Used to estimate Total Daily Energy Expenditure by applying activity-level multipliers to BMR.",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3636460/",
  },
  {
    title: "Energy Deficit per Unit Weight Loss",
    description:
      "Hall (2008), International Journal of Obesity. Used to determine calorie adjustments for weight loss or gain goals.",
    url: "https://pubmed.ncbi.nlm.nih.gov/17848938/",
  },
  {
    title: "Macronutrient Distribution Ranges (DRIs)",
    description:
      "Institute of Medicine, National Academies. Used for recommended protein, carbohydrate, and fat intake ranges.",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t5/",
  },
];

function headline(goal: string | null): string {
  switch (goal) {
    case "Lose fat":
      return "Your fat-loss plan is ready";
    case "Build muscle":
      return "Your muscle-building plan is ready";
    case "Improve energy":
      return "Your energy plan is ready";
    case "Stay fuller":
      return "Your satiety plan is ready";
    case "Eat healthier":
      return "Your nutrition plan is ready";
    case "Fuel training":
      return "Your training plan is ready";
    case "Maintain":
      return "Your maintenance plan is ready";
    default:
      return "Your personalized plan is ready";
  }
}

function insightTitle(goal: string | null): string {
  switch (goal) {
    case "Lose fat":
      return "Built for fat loss";
    case "Build muscle":
      return "Built for muscle gain";
    case "Improve energy":
      return "Built for steadier energy";
    case "Stay fuller":
      return "Built to keep you satisfied";
    case "Eat healthier":
      return "Your nutrition baseline is set";
    case "Maintain":
      return "Your maintenance targets are set";
    case "Fuel training":
      return "Fueled for training and recovery";
    default:
      return "Your plan is ready";
  }
}

function insightBody(goal: string | null): string {
  switch (goal) {
    case "Lose fat":
      return "Your daily targets are set to support steady fat loss.";
    case "Build muscle":
      return "Your daily targets are set to support muscle gain.";
    case "Improve energy":
      return "Your targets are tuned for steadier energy throughout the day.";
    case "Stay fuller":
      return "Your targets focus on protein and balance to help you stay satisfied.";
    case "Eat healthier":
      return "Your targets give you a balanced baseline to build healthier habits.";
    case "Maintain":
      return "Your targets match your current weight and activity level.";
    case "Fuel training":
      return "Your targets support your workouts and recovery.";
    default:
      return "Your daily targets are ready to go.";
  }
}

const STAGES = [
  "Building your profile...",
  "Calculating your calorie target...",
  "Setting nutritional goals...",
  "Preparing your AI nutritionist...",
];

export default function CompleteStep({
  state,
  goals,
  effectiveGoalSpeed,
  isSimulating,
  onSimulatingEnded,
}: {
  state: OnboardingState;
  goals: NutritionalGoals | null;
  effectiveGoalSpeed?: number;
  isSimulating: boolean;
  onSimulatingEnded: () => void;
}) {
  const [progress, setProgress] = useState(isSimulating ? 0 : 1);
  const [showSources, setShowSources] = useState(false);
  const [revealed, setRevealed] = useState(!isSimulating);

  useEffect(() => {
    if (!isSimulating) {
      setProgress(1);
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }
    setRevealed(false);
    const started = Date.now();
    const timer = window.setInterval(() => {
      const next = Math.min(1, (Date.now() - started) / 8000);
      setProgress(next);
      if (next >= 1) {
        window.clearInterval(timer);
        onSimulatingEnded();
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, [isSimulating, onSimulatingEnded]);

  const stage = Math.min(3, Math.floor(progress * 4));
  const projection = useMemo(() => {
    const pace = effectiveGoalSpeed ?? state.goalSpeed;
    const change = Math.abs(state.goalWeight - state.weight);
    if (pace <= 0 || change === 0) return null;
    const weeks = change / pace;
    const date = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000);
    return {
      date: date.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      change,
      pace,
      losing: state.goalWeight < state.weight,
    };
  }, [effectiveGoalSpeed, state.goalSpeed, state.goalWeight, state.weight]);

  if (isSimulating) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-6 text-center">
        <p className="font-clash text-[40px] font-semibold leading-none text-[var(--text-primary)]">
          {Math.round(progress * 100)}%
        </p>
        <h1 className="mt-2 font-clash text-[28px] font-extrabold leading-8 tracking-tight text-[var(--text-primary)]">
          Setting you up...
        </h1>
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="mt-6 text-base text-[var(--text-secondary)]">{STAGES[stage]}</p>
        <SpinningAiGlow className="mt-6 w-full" pad={12}>
          <div className="rounded-2xl bg-[var(--input-fill)] p-4 text-left">
            <p className="font-bold">Daily recommendations for</p>
            <ul className="mt-2 space-y-1 text-base">
              <SimRow label="Calories" done={stage >= 1} />
              <SimRow label="Carbs" done={stage >= 2} />
              <SimRow label="Protein" done={stage >= 2} />
              <SimRow label="Fat" done={stage >= 2} />
            </ul>
          </div>
        </SpinningAiGlow>
      </div>
    );
  }

  const unit = state.unit === "Imperial" ? "lb" : "kg";
  const changeDisplay =
    projection &&
    (state.unit === "Imperial" ? kgToLb(projection.change) : projection.change);
  const paceDisplay =
    projection &&
    (state.unit === "Imperial" ? projection.pace * 2.20462 : projection.pace);

  return (
    <div>
      <StepCopy
        title={headline(state.goal)}
        subtitle="Here's what PrepIt set up for you. Adjust goals anytime in Settings."
      />
      <Reveal visible={revealed} delay={0}>
        <div className="mt-6">
          <AiInsightCard
            title={
              projection
                ? `On track to ${projection.losing ? "lose" : "gain"} ${Number(changeDisplay).toFixed(0)} ${unit} by ${projection.date}`
                : insightTitle(state.goal)
            }
            body={
              projection
                ? `Welcome — I've set a sustainable pace of about ${Number(paceDisplay).toFixed(2)} ${unit} per week. Log meals in plain English and I'll help you stay on track. You can adjust your goals anytime in Settings.`
                : `Welcome — ${insightBody(state.goal)} Log meals in plain English and I'll help you stay on track. You can adjust your goals anytime in Settings.`
            }
          />
        </div>
      </Reveal>
      <Reveal visible={revealed} delay={120}>
        <h2 className="mt-8 text-base font-bold">Daily targets</h2>
      </Reveal>
      <Reveal visible={revealed} delay={180}>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Target icon="fire" color="#FF644F" label="Calories" value={goals ? `${Math.round(goals.calories).toLocaleString()} cal` : "—"} />
          <Target icon="wheat" color="#F38C61" label="Carbs" value={goals ? `${Math.round(goals.carbs).toLocaleString()}g` : "—"} />
          <Target icon="scale" color="#809FF9" label="Protein" value={goals ? `${Math.round(goals.protein).toLocaleString()}g` : "—"} />
          <Target icon="leaf" color="#258400" label="Fat" value={goals ? `${Math.round(goals.fats).toLocaleString()}g` : "—"} />
        </div>
      </Reveal>
      <Reveal visible={revealed} delay={260}>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Based on trusted research and official dietary guidelines.{" "}
          <button
            type="button"
            onClick={() => setShowSources(true)}
            className="font-medium text-[var(--text-primary)] underline"
          >
            View sources
          </button>
        </p>
      </Reveal>
      {showSources ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 p-4 sm:items-center sm:justify-center">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[var(--surface)] p-5 text-[var(--text-primary)]">
            <h3 className="text-lg font-bold">Our Sources</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              The calculations in this app are based on the following peer-reviewed
              research and official dietary guidelines.
            </p>
            <div className="mt-4 space-y-3">
              {SOURCES.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl bg-[var(--input-fill)] p-3.5"
                >
                  <p className="text-sm font-semibold">{source.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{source.description}</p>
                </a>
              ))}
            </div>
            <button
              type="button"
              className="mt-6 h-14 w-full rounded-2xl bg-[var(--primary)] text-base font-bold text-[var(--on-primary)]"
              onClick={() => setShowSources(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SimRow({ label, done }: { label: string; done: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span>• {label}</span>
      {done ? <PrepItIcon name="checkmark" size={20} /> : null}
    </li>
  );
}

function Target({
  icon,
  color,
  label,
  value,
}: {
  icon: "fire" | "wheat" | "scale" | "leaf";
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--input-fill)] p-4">
      <PrepItIcon name={icon} size={24} color={color} />
      <div>
        <p className="text-base font-semibold">{value}</p>
        <p className="text-xs font-medium text-[var(--text-secondary)]">{label}</p>
      </div>
    </div>
  );
}

function Reveal({
  visible,
  delay,
  children,
}: {
  visible: boolean;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div
      className="transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
