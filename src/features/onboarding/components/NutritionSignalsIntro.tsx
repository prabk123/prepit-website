"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FactorStripChart from "@/components/signals/FactorStripChart";
import {
  signedLabel,
  valueColorForComponent,
} from "@/components/signals/factorStripUtils";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import StepCopy from "@/features/onboarding/components/StepCopy";

const TODAY_DISCLAIMER =
  "This draws on what you logged today—not a wearable or a lab test. It points to patterns nutrition research has looked at; it isn’t a diagnosis or medical advice.";

const TODAY_WEIGHTS_FOOTNOTE =
  "The percentages are rough weights blended into one score. They update as you add or change today’s log.";

type DemoFactor = {
  label: string;
  signalLabel: "Energy" | "Satiety";
  snippet: string;
  summary: string;
  component: number;
  baselineComponent: number;
  baselineSummary: string;
  baselineDaysUsed: number;
  weight: number;
  intro: string;
  scienceParagraphs: string[];
};

const FACTORS: DemoFactor[] = [
  {
    label: "Fibre",
    signalLabel: "Satiety",
    snippet: "Fibre toward the daily benchmark supports feeling full for longer.",
    summary: "18g / 30g toward benchmark",
    component: 0.58,
    baselineComponent: 0.48,
    baselineSummary: "15g / 30g toward benchmark",
    baselineDaysUsed: 7,
    weight: 0.25,
    intro:
      "Fibre measures how your logged fibre stacks up against an about 28 g daily benchmark.",
    scienceParagraphs: [
      "Fibre stretches the stomach, slows digestion, and feeds gut microbes that produce short-chain fatty acids—pathways strongly linked to feeling full for longer.",
      "Higher-fibre patterns also correlate with less energy-dense meals overall.",
    ],
  },
  {
    label: "Sugar vs carbs",
    signalLabel: "Energy",
    snippet:
      "A lower sugar share of carbs lifts this slice of Energy; whole fruit and vegetables are excluded.",
    summary: "22% of carbs from sugar",
    component: 0.35,
    baselineComponent: 0.52,
    baselineSummary: "18% of carbs from sugar",
    baselineDaysUsed: 7,
    weight: 0.18,
    intro:
      "Sugar vs carbs looks at how much of today’s intake is added-style sugar. When you log plenty of carbs, it compares that sugar to your total carbs; on very low-carb days it compares sugar to your whole day so a little milk in coffee does not look like a sugar binge. Whole fruit and vegetables are excluded; juice, dried fruit, and smoothies still count.",
    scienceParagraphs: [
      "High-glycaemic loads and lots of refined carbs are linked to the spike-and-crash cycle many people notice as a mid-afternoon slump; a lower sugar share nudges this factor up.",
      "This is estimated from what you logged, not from a wearable.",
    ],
  },
  {
    label: "Glycemic load",
    signalLabel: "Energy",
    snippet:
      "A lower glycemic load — combining GI and carb portions — lifts this slice of the overall Energy score.",
    summary: "~77 daily GL",
    component: 0.68,
    baselineComponent: 0.55,
    baselineSummary: "~85 daily GL",
    baselineDaysUsed: 7,
    weight: 0.2,
    intro:
      "Glycemic load (GL) multiplies each food’s estimated glycaemic index by the carbs you actually ate, so portion size counts — not just whether a food is “high GI.”",
    scienceParagraphs: [
      "A daily GL below about 80 is considered low, above 120 is high. Lower-GL eating patterns are linked to steadier energy, less fatigue, and better blood-sugar control in controlled feeding trials.",
      "Because GL weights by carbs, a small amount of high-GI food barely moves the needle, while a large bowl of even medium-GI starch adds up. When items lack GI data, they are excluded so the score stays fair.",
    ],
  },
];

function tiltFor(weight: number, component: number) {
  return weight * (component - 0.5) * 200;
}

function SignalFactorCore({
  factor,
  snippet,
  onLearnMore,
}: {
  factor: DemoFactor;
  snippet?: string;
  onLearnMore?: () => void;
}) {
  const tilt = tiltFor(factor.weight, factor.component);
  const valueColor = valueColorForComponent(factor.component);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <p className="text-base font-semibold leading-[1.25] tracking-[0.1px] text-[var(--text-headline)]">
          {factor.label}
        </p>
        {onLearnMore ? (
          <button
            type="button"
            onClick={onLearnMore}
            className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full"
            aria-label={`Learn more about ${factor.label}`}
          >
            <PrepItIcon name="info" size={18} color="var(--grey-60)" />
          </button>
        ) : null}
      </div>
      {snippet ? (
        <p className="mt-1 text-sm leading-[1.45] text-[var(--text-body)]">
          {snippet}
        </p>
      ) : null}
      <div className="relative mt-1 h-[18px]">
        <p
          className="absolute top-0 max-w-[90%] -translate-x-1/2 truncate text-sm font-semibold leading-[1.25] text-[var(--text-body)]"
          style={{ left: `${factor.component * 100}%` }}
        >
          {factor.summary}
        </p>
      </div>
      <div className="mt-1.5 flex items-center gap-2.5">
        <FactorStripChart
          component={factor.component}
          baselineComponent={factor.baselineComponent}
        />
        <span
          className="w-8 shrink-0 text-right text-sm font-bold leading-[1.15] tabular-nums"
          style={{ color: valueColor }}
        >
          {signedLabel(tilt)}
        </span>
      </div>
      <div className="relative mt-0.5 h-[15px]">
        <p
          className="absolute top-0 max-w-[90%] -translate-x-1/2 truncate text-xs font-medium leading-[1.25] text-[var(--text-secondary)]"
          style={{ left: `${factor.baselineComponent * 100}%` }}
        >
          {factor.baselineSummary} ({factor.baselineDaysUsed}-day avg)
        </p>
      </div>
    </div>
  );
}

const SHEET_INITIAL = 0.58;
const SHEET_MIN = 0.22;
const SHEET_MAX = 0.92;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const SHEET_MS = 380;

function LearnMoreSheet({
  factor,
  onClose,
}: {
  factor: DemoFactor;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [presented, setPresented] = useState(false);
  const [size, setSize] = useState(SHEET_INITIAL);
  const [dragging, setDragging] = useState(false);
  const weightPct = Math.round(factor.weight * 100);

  const scrollRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const sizeRef = useRef(SHEET_INITIAL);
  const presentedRef = useRef(false);
  const draggingRef = useRef(false);
  const trackingRef = useRef(false);
  const fromHandleRef = useRef(false);
  const startYRef = useRef(0);
  const startSizeRef = useRef(SHEET_INITIAL);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const closingRef = useRef(false);

  onCloseRef.current = onClose;

  const setSheetSize = useCallback((next: number) => {
    sizeRef.current = next;
    setSize(next);
  }, []);

  const dismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    draggingRef.current = false;
    trackingRef.current = false;
    presentedRef.current = false;
    setDragging(false);
    setPresented(false);
    window.setTimeout(() => onCloseRef.current(), SHEET_MS + 50);
  }, []);

  useEffect(() => {
    setMounted(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const enter = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        presentedRef.current = true;
        setPresented(true);
      });
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(enter);
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [dismiss]);

  const beginTrack = (clientY: number, fromHandle: boolean) => {
    if (closingRef.current) return;
    fromHandleRef.current = fromHandle;
    trackingRef.current = true;
    startYRef.current = clientY;
    startSizeRef.current = sizeRef.current;
    lastYRef.current = clientY;
    lastTRef.current = performance.now();
    velocityRef.current = 0;
    if (fromHandle) {
      draggingRef.current = true;
      setDragging(true);
      if (scrollRef.current) scrollRef.current.style.overflowY = "hidden";
    }
  };

  const finishDrag = useCallback(() => {
    if (!draggingRef.current) {
      trackingRef.current = false;
      return;
    }
    draggingRef.current = false;
    trackingRef.current = false;
    setDragging(false);
    if (scrollRef.current) scrollRef.current.style.overflowY = "";

    const velocity = velocityRef.current;
    const current = sizeRef.current;
    if (current < SHEET_MIN || velocity > 0.85) {
      dismiss();
      return;
    }
    const mid = (SHEET_INITIAL + SHEET_MAX) / 2;
    setSheetSize(current >= mid || (velocity < -0.55 && current > SHEET_INITIAL)
      ? SHEET_MAX
      : SHEET_INITIAL);
  }, [dismiss, setSheetSize]);

  useEffect(() => {
    const handle = handleRef.current;
    const scroll = scrollRef.current;
    if (!handle) return;

    const onMove = (event: PointerEvent) => {
      if (!trackingRef.current && !draggingRef.current) return;
      const clientY = event.clientY;
      const now = performance.now();
      const dy = clientY - startYRef.current;
      const dt = now - lastTRef.current;
      if (dt > 0) velocityRef.current = (clientY - lastYRef.current) / dt;
      lastYRef.current = clientY;
      lastTRef.current = now;

      if (!draggingRef.current) {
        if (Math.abs(dy) < 8) return;
        const scrolled = (scrollRef.current?.scrollTop ?? 0) > 1;
        const pullingDown = dy > 0;
        const pullingUp = dy < 0;
        const atMax = sizeRef.current >= SHEET_MAX - 0.005;
        if (scrolled && pullingDown) {
          trackingRef.current = false;
          return;
        }
        if (pullingUp && atMax) {
          trackingRef.current = false;
          return;
        }
        draggingRef.current = true;
        setDragging(true);
        if (scrollRef.current) scrollRef.current.style.overflowY = "hidden";
      }

      if (event.cancelable) event.preventDefault();
      const next = Math.min(
        SHEET_MAX,
        Math.max(0, startSizeRef.current - dy / window.innerHeight),
      );
      setSheetSize(next);
    };

    const onUp = (event: PointerEvent) => {
      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
      finishDrag();
    };

    const onHandleDown = (event: PointerEvent) => {
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      beginTrack(event.clientY, true);
    };

    const onScrollDown = (event: PointerEvent) => {
      beginTrack(event.clientY, false);
    };

    const opts: AddEventListenerOptions = { passive: false };
    handle.addEventListener("pointerdown", onHandleDown, opts);
    scroll?.addEventListener("pointerdown", onScrollDown);
    handle.addEventListener("pointermove", onMove, opts);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
    window.addEventListener("pointermove", onMove, opts);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      handle.removeEventListener("pointerdown", onHandleDown);
      scroll?.removeEventListener("pointerdown", onScrollDown);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [mounted, finishDrag, setSheetSize]);

  const backdropOpacity = presented
    ? 0.4 * Math.min(1, size / SHEET_INITIAL)
    : 0;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black"
        style={{
          opacity: backdropOpacity,
          transition: dragging ? "none" : `opacity ${SHEET_MS}ms ${SHEET_EASE}`,
        }}
        onClick={dismiss}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-factor-learn-more-title"
        className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-2xl bg-[var(--scaffold)]"
        style={{
          height: `${size * 100}dvh`,
          transform: presented ? "translateY(0)" : "translateY(100%)",
          transition: dragging
            ? "none"
            : `transform ${SHEET_MS}ms ${SHEET_EASE}, height ${SHEET_MS}ms ${SHEET_EASE}`,
        }}
        onTransitionEnd={(event) => {
          if (event.target !== sheetRef.current) return;
          if (event.propertyName !== "transform") return;
          if (!presentedRef.current) onCloseRef.current();
        }}
      >
        <div
          ref={handleRef}
          role="slider"
          aria-label="Drag sheet"
          aria-valuemin={Math.round(SHEET_MIN * 100)}
          aria-valuemax={Math.round(SHEET_MAX * 100)}
          aria-valuenow={Math.round(size * 100)}
          aria-orientation="vertical"
          className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-2 active:cursor-grabbing"
        >
          <div className="h-1.5 w-12 rounded-full bg-[var(--border-strong)]" />
        </div>
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-1"
          style={{ touchAction: dragging ? "none" : "pan-y" }}
        >
          <h2
            id="signal-factor-learn-more-title"
            className="text-lg font-bold leading-[1.25] text-[var(--text-headline)]"
          >
            {factor.label}
          </h2>
          <p className="mt-1.5 text-[15px] leading-[1.45] text-[var(--grey-80)]">
            Part of your {factor.signalLabel} signal
          </p>
          <div className="mt-4 rounded-xl bg-[var(--surface)] px-3.5 py-3">
            <SignalFactorCore factor={factor} />
          </div>
          <p className="mt-4 text-[15px] leading-[1.45] text-[var(--grey-80)]">
            {factor.intro}
          </p>
          <p className="mt-5 text-[15px] font-bold leading-[1.45] text-[var(--text-headline)]">
            What the science says
          </p>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {factor.scienceParagraphs.map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--grey-60)]" />
                <p className="text-[15px] leading-[1.45] text-[var(--grey-60)]">
                  {line}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[15px] leading-[1.45] text-[var(--grey-80)]">
            {TODAY_DISCLAIMER}
          </p>
          <p className="mt-3.5 text-[15px] font-semibold leading-[1.45] text-[var(--grey-80)]">
            This factor is roughly {weightPct}% of your overall{" "}
            {factor.signalLabel} score.
          </p>
          <p className="mt-2.5 text-[15px] leading-[1.45] text-[var(--grey-80)]">
            {TODAY_WEIGHTS_FOOTNOTE}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function NutritionSignalsIntro() {
  const [open, setOpen] = useState<DemoFactor | null>(null);

  return (
    <div className="pb-4">
      <StepCopy
        compact
        title="A system nutritionists use to improve how you eat."
        subtitle="Understand how your diet impacts your energy, hunger levels and mood"
      />
      <div className="mt-5 flex flex-col gap-2 min-[700px]:mt-7">
        {FACTORS.map((factor) => (
          <div
            key={factor.label}
            className="rounded-xl bg-[var(--input-fill)] px-4 py-3.5 [@media(prefers-color-scheme:dark)]:bg-[var(--surface)]"
          >
            <SignalFactorCore
              factor={factor}
              snippet={factor.snippet}
              onLearnMore={() => setOpen(factor)}
            />
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-[1.5] text-[var(--grey-60)] min-[700px]:mt-5 min-[700px]:text-base">
        And 13 more factors that are important to consider...
      </p>
      {open ? (
        <LearnMoreSheet factor={open} onClose={() => setOpen(null)} />
      ) : null}
    </div>
  );
}
