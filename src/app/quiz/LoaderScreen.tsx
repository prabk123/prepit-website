"use client";

import { useEffect, useRef, useState } from "react";
import PlanCard, { type PlanCardPart } from "@/components/bridge/PlanCard";
import { Question, QUIZ_BUTTON_CLASS, QUIZ_GHOST_BUTTON_CLASS } from "@/components/quiz/parts";
import type { BridgeHandoff } from "@/lib/funnel/bridgeHandoff";
import { LOADER_QUESTIONS, LOADER_STEPS } from "@/lib/quiz/quiz";

const STEP_MS = 110;
/** The parts pull apart for about half a second once every line has ticked… */
const SPREAD_MS = 500;
/** …then the card holds before the cart opens with the same card on top. */
const HOLD_MS = 700;

/**
 * What each line adds to the card as it ticks: the still, the targets, the
 * "For…" and "You said…" lines (after both questions, which can change them),
 * then the three sessions.
 */
const PARTS_BY_STEP: PlanCardPart[][] = [[], ["targets"], ["line", "said"], ["sessions"]];

const TICK = (
  <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden>
    <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * "Building your plan" (PRE-446): about 12 seconds of a filling line and a
 * ticking checklist, paused twice by a yes or no question. As each line ticks
 * it builds the cart's plan card (PlanCard), the parts spread for a moment,
 * then the card holds and the quiz hands off to the cart. Under reduced
 * motion nothing moves; the checklist still ticks and the parts still appear.
 */
export default function LoaderScreen({
  card,
  onAnswer,
  onDone,
}: {
  /** The quiz's first sticking point and targets so far, as the cart will read them. */
  card: Pick<BridgeHandoff, "startingPoint" | "planSummary">;
  onAnswer: (key: "skipsBreakfast" | "eveningSnacks", value: "Yes" | "No") => void;
  onDone: () => void;
}) {
  const [percent, setPercent] = useState(0);
  const [asking, setAsking] = useState<(typeof LOADER_QUESTIONS)[number] | null>(null);
  const [phase, setPhase] = useState<"building" | "spread" | "held">("building");
  const asked = useRef(new Set<number>());
  const done = useRef(false);
  const sheetButton = useRef<HTMLButtonElement>(null);
  const onDoneRef = useRef(onDone);
  const endTimers = useRef<number[]>([]);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Back during the last beat must not hand off from another screen.
  useEffect(() => () => endTimers.current.forEach((timer) => window.clearTimeout(timer)), []);

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
      setPhase("spread");
      endTimers.current.push(
        window.setTimeout(() => {
          setPhase("held");
          endTimers.current.push(window.setTimeout(() => onDoneRef.current(), HOLD_MS));
        }, SPREAD_MS),
      );
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

  const ticked = LOADER_STEPS.map((_, index) => percent >= (index + 1) * 25);
  const parts = new Set(PARTS_BY_STEP.flatMap((step, index) => (ticked[index] ? step : [])));

  return (
    <>
      <div className="flex flex-col gap-3.5">
        <Question>Building your plan</Question>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3" aria-hidden>
          <i className="block h-[3px] overflow-hidden rounded-full bg-line">
            <b className="block h-full bg-primary" style={{ width: `${percent}%` }} />
          </i>
          <span className="min-w-[3ch] text-right font-display text-[15px] font-medium tabular-nums">{percent}%</span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-live="polite">
          {LOADER_STEPS.map((step, index) => (
            <li key={step} className={`flex items-center gap-2.5 text-[15px] ${ticked[index] ? "text-ink" : "text-ink-faint"}`}>
              <span
                className={`grid size-5 flex-none place-items-center rounded-full border-[1.5px] ${
                  ticked[index] ? "border-primary bg-primary text-on-primary" : "border-line-strong text-transparent"
                }`}
              >
                {TICK}
              </span>
              {step}
              {ticked[index] && <span className="sr-only">, done</span>}
            </li>
          ))}
        </ul>
      </div>
      {ticked[0] && (
        <div className="plan-part-in">
          <PlanCard from="quiz" handoff={card} parts={parts} spread={phase === "spread"} animate />
        </div>
      )}
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
