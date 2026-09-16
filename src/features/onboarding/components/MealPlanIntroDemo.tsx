"use client";

import { useEffect, useState, type ReactNode } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import PhoneDemoViewport from "@/features/onboarding/components/PhoneDemoViewport";
import { startDemoProgressTracker } from "@/features/onboarding/components/demoProgress";

const WEEK_DAYS = [
  { label: "Mon", day: 20, weekday: "Monday, 20 Jul", planned: 1540 },
  { label: "Tue", day: 21, weekday: "Tuesday, 21 Jul", planned: 1562 },
  { label: "Wed", day: 22, weekday: "Wednesday, 22 Jul", planned: 1588 },
  { label: "Thu", day: 23, weekday: "Thursday, 23 Jul", planned: 1555 },
  { label: "Fri", day: 24, weekday: "Friday, 24 Jul", planned: 1570 },
  { label: "Sat", day: 25, weekday: "Saturday, 25 Jul", planned: 1592 },
  { label: "Sun", day: 26, weekday: "Sunday, 26 Jul", planned: 1548 },
] as const;

const FOCUS_NOTE =
  "We are prioritizing high-protein staples you already enjoy to curb evening grazing and keep you satisfied longer.";

const MEALS = [
  {
    section: "Breakfast",
    title: "High Protein Greek Yogurt",
    calories: 264,
    carbs: 27,
    protein: 24,
    fats: 7,
    why: "Sticking to the same breakfast rhythm to build a stable habit before work.",
  },
  {
    section: "Lunch",
    title: "Chicken quinoa bowl",
    calories: 520,
    carbs: 48,
    protein: 42,
    fats: 14,
    why: "Higher protein lunch to carry you through the afternoon.",
  },
] as const;

const TIMING = {
  fadeMs: 350,
  establishMs: 750,
  zoomMs: 650,
  panMs: 900,
  zoomOutMs: 700,
  tapMs: 280,
  tapReleaseMs: 140,
  daySwitchMs: 550,
  confirmSavingMs: 1400,
  planCreatedHoldMs: 2200,
  resetMs: 400,
} as const;

const CYCLE_MS =
  TIMING.fadeMs +
  TIMING.establishMs +
  TIMING.zoomMs +
  (TIMING.tapMs + TIMING.tapReleaseMs + TIMING.daySwitchMs) * 3 +
  TIMING.zoomMs +
  TIMING.zoomMs +
  TIMING.tapMs +
  TIMING.tapReleaseMs +
  TIMING.confirmSavingMs +
  TIMING.panMs +
  TIMING.planCreatedHoldMs +
  TIMING.zoomOutMs +
  TIMING.resetMs;

const CAMERA = {
  zoomedOut: { zoom: 1, alignY: 0 },
  calendar: { zoom: 1.95, alignY: -0.5 },
  confirm: { zoom: 2.05, alignY: 1 },
  createdSheet: { zoom: 1.55, alignY: 0.35 },
} as const;

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

function AiChrome({
  children,
  className = "",
  radius = 16,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  return (
    <div
      className={className}
      style={{
        borderRadius: radius,
        padding: 2,
        backgroundImage:
          "linear-gradient(90deg, #809FF9 0%, #D093D9 31%, #F38C61 63%, #F3CD7F 97.5%)",
      }}
    >
      <div
        className="h-full"
        style={{
          borderRadius: radius - 2,
          backgroundImage:
            "linear-gradient(90deg, color-mix(in srgb, #809FF9 10%, var(--ai-fill-base)) 0%, color-mix(in srgb, #D093D9 10%, var(--ai-fill-base)) 31%, color-mix(in srgb, #F38C61 10%, var(--ai-fill-base)) 63%, color-mix(in srgb, #F3CD7F 10%, var(--ai-fill-base)) 97.5%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FilledIcon({ name }: { name: "chevronLeft" | "close" }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface)]">
      <PrepItIcon name={name} size={16} color="var(--black-100)" />
    </div>
  );
}

function MacroChips({
  calories,
  carbs,
  protein,
  fats,
}: {
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FF644F1A] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--calorie-text)]">
        <PrepItIcon name="fire" size={11} color="#FF644F" />
        {fmt(calories)} kcal
      </span>
      {(
        [
          ["C", carbs],
          ["P", protein],
          ["F", fats],
        ] as const
      ).map(([letter, grams]) => (
        <span
          key={letter}
          className="rounded-full bg-[var(--input-fill)] px-1.5 py-0.5 text-[10px] text-[var(--black-100)]"
        >
          <span className="font-extrabold">{letter}</span>
          <span className="font-medium"> {grams}g</span>
        </span>
      ))}
    </div>
  );
}

function MealCard({
  meal,
  pressed = false,
}: {
  meal: (typeof MEALS)[number];
  pressed?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] border bg-[var(--surface)] p-3 transition-transform duration-[120ms] ease-out ${
        pressed ? "scale-[0.97] border-[1.5px] border-[var(--primary)]" : "border-[var(--border-strong)]"
      }`}
    >
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-[13px] font-medium leading-[19px] text-[var(--black-100)]">
          {meal.title}
        </p>
        <PrepItIcon name="swap" size={16} color="var(--black-100)" />
      </div>
      <div className="mt-2">
        <MacroChips
          calories={meal.calories}
          carbs={meal.carbs}
          protein={meal.protein}
          fats={meal.fats}
        />
      </div>
      <div className="mt-2.5 flex items-start gap-1.5">
        <PrepItIcon name="sparkles" size={14} color="var(--black-100)" />
        <p className="line-clamp-2 text-[10px] leading-[14px] text-[var(--grey-80)]">
          {meal.why}
        </p>
      </div>
    </div>
  );
}

function PlanScreen({
  selectedDay,
  pressedDay,
  highlightConfirm,
  confirmLoading,
  showCreatedSheet,
}: {
  selectedDay: number;
  pressedDay: number | null;
  highlightConfirm: boolean;
  confirmLoading: boolean;
  showCreatedSheet: boolean;
}) {
  const selected = WEEK_DAYS[selectedDay];

  return (
    <div className="relative flex h-full flex-col bg-[var(--scaffold)]">
      <div className="flex shrink-0 items-center px-3 pb-1 pt-11">
        <FilledIcon name="chevronLeft" />
        <p className="flex-1 text-center text-[13px] font-bold text-[var(--black-100)]">
          Create Meal Plan
        </p>
        <FilledIcon name="close" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-3 pb-2 pt-1.5">
        <AiChrome className="mb-1.5">
          <div className="flex items-start gap-2 px-3 py-2.5">
            <PrepItIcon name="sparkles" size={16} color="var(--black-100)" />
            <p className="line-clamp-3 text-[12px] font-medium leading-[17px] text-[var(--grey-80)]">
              {FOCUS_NOTE}
            </p>
          </div>
        </AiChrome>

        <div className="rounded-[14px] border border-[var(--grey-10)] bg-[var(--surface)] p-2.5">
          <div className="flex items-start justify-around">
            {WEEK_DAYS.map((day, index) => {
              const selectedDayMatch = index === selectedDay;
              const pressed = pressedDay === index;
              return (
                <div key={day.day} className="flex flex-col items-center">
                  <span
                    className={`text-[9px] ${
                      selectedDayMatch ? "font-bold" : "font-normal"
                    }`}
                  >
                    {day.label}
                  </span>
                  <div
                    className={`mt-1.5 flex h-[30px] w-[30px] items-center justify-center rounded-full text-xs transition-[transform,background-color] duration-[180ms] ${
                      pressed ? "scale-[0.97]" : ""
                    } ${
                      selectedDayMatch
                        ? "bg-[var(--primary)] font-bold text-[var(--on-primary)]"
                        : "font-medium text-[var(--black-100)]"
                    }`}
                  >
                    {day.day}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 rounded-xl bg-[var(--input-fill)] px-2.5 py-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold">Daily target</p>
              <p className="text-[10px]">1,570 kcal</p>
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <p className="text-[10px] font-bold">{selected.weekday}</p>
              <p className="inline-flex items-center gap-0.5 text-[11px] font-bold">
                <PrepItIcon name="fire" size={12} color="#FF644F" />
                {fmt(selected.planned)} kcal
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 rounded-[14px] border border-[var(--grey-10)] bg-[var(--surface)] p-3">
          {MEALS.map((meal, index) => (
            <div key={meal.title} className={index > 0 ? "mt-4" : ""}>
              <p className="mb-1.5 text-sm font-bold text-[var(--grey-80)]">
                {meal.section}
              </p>
              <MealCard meal={meal} />
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-[var(--grey-10)] bg-[var(--surface)] px-3 pb-3 pt-2.5">
        <div className="mb-3 flex items-center">
          <div className="flex flex-1 items-center gap-1">
            <PrepItIcon name="chevronLeft" size={18} color="var(--black-100)" />
            <span className="text-xs font-bold">Prev Day</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span className="text-xs font-bold">Next Day</span>
            <PrepItIcon name="chevronRight" size={18} color="var(--black-100)" />
          </div>
        </div>
        <div className="flex gap-2">
          <AiChrome className="min-w-0 flex-1" radius={14}>
            <div className="flex h-11 items-center justify-center gap-1">
              <PrepItIcon name="sparkles" size={14} color="var(--black-100)" />
              <span className="text-[11px] font-bold">Ask Nutritionist</span>
            </div>
          </AiChrome>
          <div
            className={`flex h-11 min-w-0 flex-1 items-center justify-center rounded-[14px] bg-[var(--primary)] text-[13px] font-bold text-[var(--on-primary)] transition-[transform,opacity] duration-[120ms] ${
              highlightConfirm ? "scale-[0.97]" : ""
            } ${confirmLoading ? "opacity-50" : ""}`}
          >
            {confirmLoading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--on-primary)]/30 border-t-[var(--on-primary)]" />
            ) : (
              "Confirm"
            )}
          </div>
        </div>
      </div>

      {showCreatedSheet ? (
        <>
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[20px] bg-[var(--surface)] shadow-[0_-8px_40px_rgba(0,0,0,0.18)]">
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-[var(--border-strong)]" />
            </div>
            <div className="px-4 pb-7 pt-5 text-center">
              <p className="text-[40px] leading-none">💪</p>
              <p className="mt-3 text-[17px] font-bold leading-6">
                Your plan is ready!
              </p>
              <p className="mt-1.5 text-[13px] leading-[19px] text-[var(--grey-60)]">
                One step closer to eating better & easier.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function MealPlanIntroDemo({
  onProgressChanged,
}: {
  onProgressChanged?: (progress: number) => void;
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [pressedDay, setPressedDay] = useState<number | null>(null);
  const [highlightConfirm, setHighlightConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showCreatedSheet, setShowCreatedSheet] = useState(false);
  const [zoom, setZoom] = useState(CAMERA.zoomedOut.zoom);
  const [alignY, setAlignY] = useState(CAMERA.zoomedOut.alignY);
  const [zoomDurationMs, setZoomDurationMs] = useState(TIMING.zoomMs);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;
    let stopProgress = () => {};
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const camera = async (
      next: { zoom: number; alignY: number },
      durationMs: number,
    ) => {
      setZoomDurationMs(durationMs);
      setZoom(next.zoom);
      setAlignY(next.alignY);
      await wait(durationMs);
    };

    const tapDay = async (day: number) => {
      setPressedDay(day);
      setSelectedDay(day);
      await wait(TIMING.tapMs);
      setPressedDay(null);
      await wait(TIMING.tapReleaseMs);
    };

    const run = async () => {
      while (!cancelled) {
        stopProgress();
        stopProgress = startDemoProgressTracker(CYCLE_MS, onProgressChanged);
        setSelectedDay(1);
        setPressedDay(null);
        setHighlightConfirm(false);
        setConfirmLoading(false);
        setShowCreatedSheet(false);
        setZoom(CAMERA.zoomedOut.zoom);
        setAlignY(CAMERA.zoomedOut.alignY);
        await wait(TIMING.fadeMs + TIMING.establishMs);
        if (cancelled) return;

        await camera(CAMERA.calendar, TIMING.zoomMs);
        if (cancelled) return;

        for (const day of [2, 3, 1]) {
          await tapDay(day);
          if (cancelled) return;
          await wait(TIMING.daySwitchMs);
          if (cancelled) return;
        }

        await camera(CAMERA.zoomedOut, TIMING.zoomMs);
        if (cancelled) return;

        await camera(CAMERA.confirm, TIMING.zoomMs);
        if (cancelled) return;

        setHighlightConfirm(true);
        await wait(TIMING.tapMs);
        if (cancelled) return;
        setHighlightConfirm(false);
        await wait(TIMING.tapReleaseMs);
        if (cancelled) return;

        setConfirmLoading(true);
        await wait(TIMING.confirmSavingMs);
        if (cancelled) return;

        setConfirmLoading(false);
        setShowCreatedSheet(true);
        await camera(CAMERA.createdSheet, TIMING.panMs);
        if (cancelled) return;
        await wait(TIMING.planCreatedHoldMs);
        if (cancelled) return;

        await camera(CAMERA.zoomedOut, TIMING.zoomOutMs);
        if (cancelled) return;
        await wait(TIMING.resetMs);
      }
    };

    void run();
    return () => {
      cancelled = true;
      stopProgress();
      clearTimeout(timeout);
    };
  }, [onProgressChanged]);

  return (
    <PhoneDemoViewport zoom={zoom} alignY={alignY} zoomDurationMs={zoomDurationMs}>
      <PlanScreen
        selectedDay={selectedDay}
        pressedDay={pressedDay}
        highlightConfirm={highlightConfirm}
        confirmLoading={confirmLoading}
        showCreatedSheet={showCreatedSheet}
      />
    </PhoneDemoViewport>
  );
}
