"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { NutritionalGoals } from "@/lib/prepitApi";
import type { OnboardingState } from "@/features/onboarding/state";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import PlanSummary from "@/features/onboarding/components/PlanSummary";
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

  return (
    <div>
      <StepCopy
        title={headline(state.goal)}
        subtitle="Here's what PrepIt set up for you. Adjust goals anytime in Settings."
      />
      <Reveal visible={revealed} delay={0}>
        <div className="mt-6">
          <PlanSummary
            state={state}
            goals={goals}
            effectiveGoalSpeed={effectiveGoalSpeed}
          />
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
