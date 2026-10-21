"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Question, QUIZ_BUTTON_CLASS, QUIZ_GHOST_BUTTON_CLASS } from "@/components/quiz/parts";
import { LOADER_QUESTIONS, LOADER_STEPS } from "@/lib/quiz/quiz";

const STEP_MS = 110;
const RING = 2 * Math.PI * 52;

function subscribe(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const TICK = (
  <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden>
    <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * "Building your plan": about 12 seconds of a filling ring and a ticking
 * checklist, paused twice by a yes or no question whose answers name the
 * plan page's starting point. Under reduced motion only the checklist ticks.
 */
export default function LoaderScreen({
  onAnswer,
  onDone,
}: {
  onAnswer: (key: "skipsBreakfast" | "eveningSnacks", value: "Yes" | "No") => void;
  onDone: () => void;
}) {
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const [percent, setPercent] = useState(0);
  const [asking, setAsking] = useState<(typeof LOADER_QUESTIONS)[number] | null>(null);
  const asked = useRef(new Set<number>());
  const done = useRef(false);
  const sheetButton = useRef<HTMLButtonElement>(null);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (asking) return;
    const timer = window.setInterval(() => {
      setPercent((p) => Math.min(100, p + 1));
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [asking]);

  useEffect(() => {
    const question = LOADER_QUESTIONS.find((q) => q.at === percent && !asked.current.has(q.at));
    if (question) {
      asked.current.add(question.at);
      setAsking(question);
      return;
    }
    if (percent >= 100 && !done.current) {
      done.current = true;
      window.setTimeout(() => onDoneRef.current(), 500);
    }
  }, [percent]);

  useEffect(() => {
    if (asking) sheetButton.current?.focus();
  }, [asking]);

  const answer = (value: "Yes" | "No") => {
    if (!asking) return;
    onAnswer(asking.key, value);
    setAsking(null);
  };

  return (
    <>
      <div className="text-center">
        <Question>Building your plan</Question>
      </div>
      {!reduced && (
        <svg className="mx-auto mt-1.5 block size-[120px]" viewBox="0 0 120 120" aria-hidden>
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-line)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - percent / 100)}
            transform="rotate(-90 60 60)"
          />
        </svg>
      )}
      <p className="text-center font-display text-[44px] font-medium tabular-nums" aria-hidden>
        {percent}%
      </p>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-live="polite">
        {LOADER_STEPS.map((step, index) => {
          const ticked = percent >= (index + 1) * 25;
          return (
            <li key={step} className={`flex items-center gap-2.5 text-[15px] ${ticked ? "text-ink" : "text-ink-faint"}`}>
              <span
                className={`grid size-5 flex-none place-items-center rounded-full border-[1.5px] ${
                  ticked ? "border-primary bg-primary text-on-primary" : "border-line-strong text-transparent"
                }`}
              >
                {TICK}
              </span>
              {step}
              {ticked && <span className="sr-only">, done</span>}
            </li>
          );
        })}
      </ul>
      {asking && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-overlay">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="loader-question"
            className="flex w-full max-w-[520px] flex-col gap-3.5 rounded-t-[28px] bg-surface px-5 pb-[calc(26px+env(safe-area-inset-bottom,0px))] pt-[22px]"
          >
            <p className="text-eyebrow font-medium uppercase tracking-[0.12em] text-ink-muted">{asking.eyebrow}</p>
            <h2 id="loader-question" className="font-display text-[24px] font-medium leading-[1.15] text-ink">
              {asking.question}
            </h2>
            <div className="flex gap-2">
              <button ref={sheetButton} type="button" className={`${QUIZ_GHOST_BUTTON_CLASS} h-[52px]`} onClick={() => answer("No")}>
                No
              </button>
              <button type="button" className={`${QUIZ_BUTTON_CLASS} h-[52px]`} onClick={() => answer("Yes")}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
