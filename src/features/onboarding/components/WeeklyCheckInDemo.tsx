"use client";

import { useEffect, useRef, useState } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import PhoneDemoViewport from "@/features/onboarding/components/PhoneDemoViewport";
import { startDemoProgressTracker } from "@/features/onboarding/components/demoProgress";

const DAYS = [
  { label: "T", calories: 1920, protein: 132, burned: 2380, logged: true },
  { label: "W", calories: 1885, protein: 128, burned: 2310, logged: true },
  { label: "T", calories: 2010, protein: 125, burned: 2420, logged: true },
  { label: "F", calories: 1955, protein: 131, burned: 2365, logged: true },
  { label: "S", calories: 2280, protein: 108, burned: 2510, logged: true },
  { label: "S", calories: 2195, protein: 112, burned: 2460, logged: true },
  { label: "M", calories: 1870, protein: 129, burned: 2295, logged: true },
] as const;

const WEIGHTS = [79.4, 79.0, 78.6, 78.2];
const SPARKLINE = [79.8, 79.5, 79.2, 78.9, 78.6, 78.4, 78.2];

const COPY = {
  weekRange: "2 Jun – 8 Jun",
  headline: "Solid logging — protein needs attention",
  summary:
    "You logged all seven days and stayed close to your calorie target on weekdays. Weekend meals ran higher and protein dipped below target on three days, which can make hunger creep back mid-week.",
  keyInsight:
    "Your weekday structure is working. Adding ~15g protein at lunch on weekend days would close the gap without changing your overall plan.",
  nextFocusTitle: "Front-load protein at lunch",
  nextFocusDetail:
    "Aim for 30g+ protein at lunch on Saturday and Sunday — Greek yogurt, eggs, or chicken — to keep Satiety steady through the afternoon.",
  bannerSubtitle:
    "Reflect on your week and get a personalised review of your progress.",
} as const;

const TIMING = {
  fadeMs: 350,
  homeHoldMs: 1800,
  tapMs: 220,
  tapHoldMs: 120,
  zoomInMs: 800,
  checkInIntroHoldMs: 500,
  reportScrollMs: 5200,
  reportBottomPanMs: 2000,
  reportBottomHoldMs: 1800,
  zoomOutMs: 850,
  resetMs: 500,
} as const;

const CYCLE_MS =
  TIMING.fadeMs +
  TIMING.homeHoldMs +
  TIMING.tapMs +
  TIMING.tapHoldMs +
  TIMING.fadeMs +
  TIMING.zoomInMs +
  TIMING.checkInIntroHoldMs +
  TIMING.reportScrollMs +
  TIMING.reportBottomPanMs +
  TIMING.reportBottomHoldMs +
  TIMING.zoomOutMs +
  TIMING.fadeMs +
  TIMING.resetMs;

function BannerCard({ pressed }: { pressed: boolean }) {
  return (
    <div className="mx-6 w-full max-w-[360px] rounded-2xl border border-[var(--grey-10)] bg-[var(--surface)] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <div className="flex gap-4">
        <div className="flex w-9 shrink-0 flex-col items-center pt-0.5">
          <span className="text-[11px] font-bold leading-[1.5] text-[var(--grey-40)]">
            Jun
          </span>
          <span className="text-sm font-semibold leading-tight">9</span>
        </div>
        <div className="relative flex w-[15px] shrink-0 flex-col items-center">
          <div className="mt-[22px] h-2.5 w-2.5 rounded-full bg-[var(--coral-100)]" />
          <div className="mt-1 w-px flex-1 border-l border-dashed border-[var(--grey-40)]" />
        </div>
        <div
          className={`min-w-0 flex-1 rounded-xl bg-[var(--grey-5)] px-4 py-3 transition-transform duration-[220ms] ease-out ${
            pressed ? "scale-95" : "scale-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-[1.5]">Weekly check-in</p>
              <p className="mt-1 text-xs font-semibold leading-[1.5] text-[var(--grey-60)]">
                {COPY.weekRange}
              </p>
              <p className="mt-1 text-xs leading-[1.5] text-[var(--grey-60)]">
                {COPY.bannerSubtitle}
              </p>
            </div>
            <PrepItIcon name="chevronRight" size={20} color="var(--grey-60)" />
          </div>
        </div>
      </div>

      <div className="mt-1 flex gap-4">
        <div className="flex w-9 shrink-0 flex-col items-center pt-0.5">
          <span className="text-[11px] font-bold leading-[1.5] text-[var(--grey-40)]">
            Jun
          </span>
          <span className="text-sm font-semibold leading-tight">16</span>
        </div>
        <div className="relative flex w-[15px] shrink-0 flex-col items-center">
          <div className="-mt-1 h-4 w-px border-l border-dashed border-[var(--grey-40)]" />
          <div className="h-2 w-2 rounded-full border-[1.5px] border-[var(--grey-40)] bg-[var(--surface)]" />
        </div>
        <div className="min-w-0 flex-1 rounded-xl bg-[var(--surface-tertiary)] px-4 py-3">
          <p className="text-xs font-medium leading-[1.5] text-[var(--grey-80)]">
            Next check-in
          </p>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const w = 88;
  const h = 56;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * (w - 4) + 2;
      const y = h - 6 - ((value - min) / (max - min || 1)) * (h - 14);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        fill="none"
        stroke="var(--coral-100)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function DualBars() {
  const max = Math.max(...DAYS.map((day) => Math.max(day.calories, day.burned)));
  return (
    <div className="flex h-[88px] items-end gap-1">
      {DAYS.map((day, index) => (
        <div key={`${day.label}-${index}`} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-16 w-full items-end justify-center gap-0.5">
            <div
              className="w-[45%] rounded-t-sm bg-[var(--coral-100)]"
              style={{ height: `${(day.calories / max) * 100}%` }}
            />
            <div
              className="w-[45%] rounded-t-sm bg-[#FF9284]"
              style={{ height: `${(day.burned / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[var(--grey-40)]">{day.label}</span>
        </div>
      ))}
    </div>
  );
}

function ProteinBars() {
  const target = 130;
  const max = Math.max(target, ...DAYS.map((day) => day.protein));
  return (
    <div className="relative flex h-[88px] items-end gap-1">
      <div
        className="absolute left-0 right-0 border-t border-dashed border-[var(--grey-40)]"
        style={{ bottom: `${(target / max) * 64 + 16}px` }}
      />
      {DAYS.map((day, index) => (
        <div key={`${day.label}-${index}`} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-16 w-full items-end justify-center">
            <div
              className="w-[70%] rounded-t-sm bg-[#0074E8]"
              style={{ height: `${(day.protein / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-[var(--grey-40)]">{day.label}</span>
        </div>
      ))}
    </div>
  );
}

function WeightTrend() {
  const min = Math.min(...WEIGHTS) - 0.2;
  const max = Math.max(...WEIGHTS) + 0.2;
  const w = 240;
  const h = 64;
  const points = WEIGHTS.map((value, index) => {
    const x = (index / (WEIGHTS.length - 1)) * (w - 8) + 4;
    const y = h - 8 - ((value - min) / (max - min)) * (h - 16);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="h-16 w-full" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        fill="none"
        stroke="var(--coral-100)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function MetricPair({
  leftLabel,
  leftValue,
  leftUnit,
  rightLabel,
  rightValue,
  rightUnit,
  alignRight = true,
}: {
  leftLabel: string;
  leftValue: string;
  leftUnit: string;
  rightLabel: string;
  rightValue: string;
  rightUnit: string;
  alignRight?: boolean;
}) {
  return (
    <div className="flex min-w-0 gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold leading-none" style={{ fontFamily: "var(--font-brand)" }}>
          {leftValue}
          <span className="ml-1 text-[11px] font-medium text-[var(--grey-40)]">{leftUnit}</span>
        </p>
        <p className="mt-1 text-[11px] font-medium text-[var(--grey-60)]">{leftLabel}</p>
      </div>
      <div className={`min-w-0 flex-1 ${alignRight ? "text-right" : ""}`}>
        <p className="text-lg font-semibold leading-none" style={{ fontFamily: "var(--font-brand)" }}>
          {rightValue}
          <span className="ml-1 text-[11px] font-medium text-[var(--grey-40)]">{rightUnit}</span>
        </p>
        <p className="mt-1 truncate text-xs font-medium text-[var(--grey-60)]">{rightLabel}</p>
      </div>
    </div>
  );
}

function ReportCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--grey-10)] bg-[var(--surface)] p-3.5">
      {children}
    </div>
  );
}

function ReportScreen({
  startScroll,
  cycleKey,
}: {
  startScroll: boolean;
  cycleKey: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    if (!startScroll) return;

    const to = Math.max(0, el.scrollHeight - el.clientHeight);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TIMING.reportScrollMs);
      const eased = t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2;
      el.scrollTop = to * eased;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [startScroll, cycleKey]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--grey-5)]">
      <div className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-11">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface)]">
          <PrepItIcon name="chevronLeft" size={16} />
        </div>
        <p className="flex-1 text-center text-sm font-bold">Weekly Check-In</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface)]">
          <PrepItIcon name="close" size={16} />
        </div>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-hidden px-4 pb-8">
        <p className="text-xs font-semibold text-[var(--grey-60)]">{COPY.weekRange}</p>
        <h2 className="mt-3 text-base font-bold leading-[1.3]">{COPY.headline}</h2>
        <p className="mt-2 text-[13px] font-medium leading-[1.5] text-[var(--grey-80)]">
          {COPY.summary}
        </p>

        <div className="mt-5">
          <ReportCard>
            <p className="text-xs font-bold tracking-wide text-[var(--grey-60)]">Goal</p>
            <p className="mt-1.5 text-xl font-semibold" style={{ fontFamily: "var(--font-brand)" }}>
              Lose weight
            </p>
            <p className="mt-2 text-xs font-medium leading-[1.4] text-[var(--grey-80)]">
              Logging is consistent and weight is moving in the right direction.
            </p>
            <div className="mt-2.5">
              <Sparkline values={SPARKLINE} />
            </div>
            <div className="mt-3">
              <MetricPair
                leftLabel="Weight"
                leftValue="78.2"
                leftUnit="kg"
                rightLabel="Goal weight"
                rightValue="72.0"
                rightUnit="kg"
              />
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="font-bold">Pace</span>
              <span className="text-[var(--grey-80)]">-0.4 kg/week</span>
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="font-bold">Goal pace</span>
              <span className="text-[var(--grey-80)]">-0.5 kg/week</span>
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--grey-5)] px-2.5 py-1">
              <PrepItIcon name="checkmark" size={12} color="#258400" />
              <span className="text-[11px] font-bold text-[#258400]">On pace</span>
            </div>
          </ReportCard>
        </div>

        <div className="mt-2">
          <ReportCard>
            <p className="text-xs font-bold tracking-wide text-[var(--grey-60)]">
              Calorie balance
            </p>
            <div className="mt-1.5">
              <MetricPair
                leftLabel="Avg eaten"
                leftValue="2,016"
                leftUnit="cal"
                rightLabel="Avg burned"
                rightValue="2,391"
                rightUnit="cal"
              />
            </div>
            <p className="mt-2 text-sm font-bold">~375 cal/day deficit</p>
            <div className="mt-2.5">
              <DualBars />
            </div>
            <p className="mt-2 text-xs font-medium leading-[1.4] text-[var(--grey-80)]">
              Weekday intake tracked close to burn; Saturday and Sunday ran higher against a
              steadier burn — worth planning weekend lunches ahead.
            </p>
          </ReportCard>
        </div>

        <div className="mt-2">
          <ReportCard>
            <p className="text-xs font-bold tracking-wide text-[var(--grey-60)]">Protein</p>
            <div className="mt-1.5">
              <MetricPair
                leftLabel="Average"
                leftValue="118"
                leftUnit="g"
                rightLabel="Target"
                rightValue="130"
                rightUnit="g"
              />
            </div>
            <div className="mt-2.5">
              <ProteinBars />
            </div>
            <p className="mt-2 text-xs font-medium leading-[1.4] text-[var(--grey-80)]">
              Weekend lunches leaned lighter on protein — adding Greek yogurt or eggs would
              close the gap without changing your overall plan.
            </p>
          </ReportCard>
        </div>

        <div className="mt-2">
          <ReportCard>
            <p className="text-xs font-bold tracking-wide text-[var(--grey-60)]">Logging</p>
            <p className="mt-1.5 text-sm font-bold">7 of 7 days</p>
            <div className="mt-3 flex">
              {DAYS.map((day, index) => (
                <div key={`${day.label}-${index}`} className="flex flex-1 flex-col items-center">
                  <PrepItIcon name="fire" size={22} color="var(--coral-100)" />
                  <span className="mt-1 text-[10px] font-semibold text-[var(--grey-40)]">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs font-medium leading-[1.4] text-[var(--grey-80)]">
              Full week logged — great consistency to build on.
            </p>
          </ReportCard>
        </div>

        <div className="mt-2">
          <ReportCard>
            <p className="text-xs font-bold tracking-wide text-[var(--grey-60)]">Weight trend</p>
            <p className="mt-1.5 text-sm font-bold">-0.4 kg/week</p>
            <div className="mt-2.5">
              <WeightTrend />
            </div>
            <p className="mt-4 text-xs font-medium leading-[1.4] text-[var(--grey-80)]">
              The trend is moving in the right direction — keep the weekday rhythm and tighten
              weekend protein.
            </p>
          </ReportCard>
        </div>

        <div className="mt-3">
          <ReportCard>
            <div className="flex items-center gap-2">
              <PrepItIcon name="sparkles" size={16} />
              <p className="text-xs font-bold text-[var(--grey-60)]">Key insight</p>
            </div>
            <p className="mt-2 text-[13px] font-medium leading-[1.4] text-[var(--grey-80)]">
              {COPY.keyInsight}
            </p>
          </ReportCard>
        </div>

        <div className="mt-3 rounded-2xl bg-[var(--primary)] p-5 text-[var(--on-primary)]">
          <div className="flex items-center gap-2">
            <PrepItIcon name="goal" size={16} color="var(--on-primary)" />
            <p className="text-[11px] font-bold tracking-[0.4px] text-[var(--on-primary)]/70">
              NEXT WEEK&apos;S FOCUS
            </p>
          </div>
          <p className="mt-3 text-sm font-bold leading-[1.3]">{COPY.nextFocusTitle}</p>
          <p className="mt-2 text-[13px] leading-[1.5] text-[var(--on-primary)]/90">{COPY.nextFocusDetail}</p>
        </div>
      </div>
    </div>
  );
}

export default function WeeklyCheckInDemo({
  onProgressChanged,
}: {
  onProgressChanged?: (progress: number) => void;
}) {
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [startScroll, setStartScroll] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [alignY, setAlignY] = useState(0);
  const [zoomDurationMs, setZoomDurationMs] = useState(TIMING.zoomInMs);
  const [cycleKey, setCycleKey] = useState(0);

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

    const run = async () => {
      while (!cancelled) {
        stopProgress();
        stopProgress = startDemoProgressTracker(CYCLE_MS, onProgressChanged);
        setPhoneVisible(false);
        setPressed(false);
        setStartScroll(false);
        setZoom(1);
        setAlignY(0);
        setZoomDurationMs(TIMING.zoomInMs);
        setCycleKey((key) => key + 1);

        await wait(TIMING.fadeMs);
        if (cancelled) return;
        await wait(TIMING.homeHoldMs);
        if (cancelled) return;

        setPressed(true);
        await wait(TIMING.tapMs);
        if (cancelled) return;
        setPressed(false);
        await wait(TIMING.tapHoldMs);
        if (cancelled) return;

        setPhoneVisible(true);
        await wait(TIMING.fadeMs);
        if (cancelled) return;

        setAlignY(-1);
        setZoomDurationMs(TIMING.zoomInMs);
        setZoom(8);
        await wait(TIMING.zoomInMs);
        if (cancelled) return;
        await wait(TIMING.checkInIntroHoldMs);
        if (cancelled) return;

        setStartScroll(true);
        await wait(TIMING.reportScrollMs);
        if (cancelled) return;

        setZoomDurationMs(TIMING.reportBottomPanMs);
        setAlignY(1);
        await wait(TIMING.reportBottomPanMs);
        if (cancelled) return;
        await wait(TIMING.reportBottomHoldMs);
        if (cancelled) return;

        setZoomDurationMs(TIMING.zoomOutMs);
        setAlignY(0);
        setZoom(1);
        await wait(TIMING.zoomOutMs);
        if (cancelled) return;

        setPhoneVisible(false);
        await wait(TIMING.fadeMs);
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
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[350ms] ease-out ${
          phoneVisible ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <BannerCard pressed={pressed} />
      </div>
      <div
        className={`absolute inset-0 transition-opacity duration-[350ms] ease-out ${
          phoneVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <PhoneDemoViewport zoom={zoom} alignY={alignY} zoomDurationMs={zoomDurationMs}>
          <ReportScreen startScroll={startScroll} cycleKey={cycleKey} />
        </PhoneDemoViewport>
      </div>
    </div>
  );
}
