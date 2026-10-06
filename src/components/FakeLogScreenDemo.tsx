"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BoltIcon, SpaIcon } from "@/components/demoIcons";
import PrepItIcon from "@/components/shareable/PrepItIcon";

/** Matches PrepItColors.light from fresca_app/lib/theme/prep_it_colors.dart */
const C = {
  scaffold: "#F4F4F5",
  surface: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#7A7A82",
  textTertiary: "#A6A6AC",
  textBody: "#4D4D59",
  border: "#E9E9EA",
  borderStrong: "#D3D3D5",
  inputFill: "#F4F4F5",
  calorieAccent: "#FF644F",
  onTrackText: "#258400",
  onTrackBg: "#EBFFE3",
  calChipBg: "rgba(255, 100, 79, 0.1)",
  calChipText: "#B24637",
  green: "#40E300",
  yellow: "#FFB800",
  red: "#FF644F",
  neutral: "#8E8E93",
} as const;

export const DESIGN_WIDTH = 390;
export const DESIGN_HEIGHT = 844;
const STATUS_BAR = 47;
const HOME_INDICATOR = 34;

const dmSans = { fontFamily: "var(--font-dm-sans)" } as const;
const brand = { fontFamily: "var(--font-brand)" } as const;

export type LogDay = {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  energy: number;
  satiety: number;
  mood: number;
};

type Signals = { energy: number; satiety: number; mood: number };

type LogEntry = {
  title: string;
  hourLabel: string;
  timeLabel: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  signals: Signals;
};

export const LOG_GOALS = { calories: 2000, carbs: 250, protein: 150, fat: 65 } as const;

export const BREAKFAST: LogEntry = {
  title: "Greek yogurt with berries",
  hourLabel: "8 AM",
  timeLabel: "8:15 AM",
  calories: 312,
  carbs: 28,
  protein: 24,
  fat: 8,
  signals: { energy: 4, satiety: 6, mood: 2 },
};

export const LUNCH: LogEntry = {
  title: "Chicken wrap, an apple and a flat white",
  hourLabel: "12 PM",
  timeLabel: "12:30 PM",
  calories: 487,
  carbs: 42,
  protein: 26,
  fat: 19,
  signals: { energy: 3, satiety: 5, mood: 0 },
};

export const DAY_BEFORE: LogDay = {
  calories: 312,
  carbs: 28,
  protein: 24,
  fat: 8,
  energy: 62,
  satiety: 58,
  mood: 74,
};

export const DAY_AFTER: LogDay = {
  calories: 799,
  carbs: 70,
  protein: 50,
  fat: 27,
  energy: 68,
  satiety: 66,
  mood: 74,
};

/** Counts from the previous value to [value] so totals tick up like the app. */
function useCountTo(value: number, durationMs = 700) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (value - from) * eased);
      setShown(next);
      fromRef.current = next;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return shown;
}

function scoreColor(score: number) {
  if (score >= 70) return C.green;
  if (score >= 40) return C.yellow;
  return C.red;
}

function deltaColor(delta: number) {
  if (delta >= 1) return C.green;
  if (delta === 0) return C.neutral;
  if (delta >= -5) return C.yellow;
  return C.red;
}

function SignalIcon({
  kind,
  size,
  color,
}: {
  kind: keyof Signals;
  size: number;
  color: string;
}) {
  if (kind === "energy") return <BoltIcon size={size} color={color} />;
  if (kind === "satiety") return <PrepItIcon name="apple" size={size} color={color} />;
  return <SpaIcon size={size} color={color} />;
}

const SIGNAL_KINDS: { kind: keyof Signals; label: string }[] = [
  { kind: "energy", label: "Energy" },
  { kind: "satiety", label: "Satiety" },
  { kind: "mood", label: "Mood" },
];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-4 rounded-[20px] border bg-white ${className}`}
      style={{ borderColor: C.border }}
    >
      {children}
    </div>
  );
}

function LogHeader() {
  return (
    <div className="flex h-14 items-center gap-2 px-4">
      <Image src="/logo.png" alt="" width={32} height={32} className="rounded-[9px]" />
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <span className="text-xl font-bold leading-[30px] text-black" style={brand}>
          Today, 6 Oct
        </span>
        <PrepItIcon name="chevronDown" size={22} color={C.textPrimary} />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-white px-2 py-2" style={dmSans}>
        <PrepItIcon name="fire" size={22} color={C.calorieAccent} />
        <span className="text-sm font-bold leading-[21px] text-black">4</span>
      </div>
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-bold text-black"
        style={dmSans}
      >
        A
      </div>
    </div>
  );
}

function SignalRing({ score, kind, label }: { score: number; kind: keyof Signals; label: string }) {
  const size = 84;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = scoreColor(score);
  const shown = useCountTo(score);

  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeOpacity={0.15}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - score / 100)}
            style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-black"
          style={brand}
        >
          {shown}
        </span>
      </div>
      <span
        className="flex items-center gap-1 text-xs font-medium"
        style={{ ...dmSans, color: C.textBody }}
      >
        <SignalIcon kind={kind} size={12} color={C.textBody} />
        {label}
      </span>
    </div>
  );
}

function SignalRingsCard({ day }: { day: LogDay }) {
  return (
    <Card className="flex px-2 py-4">
      {SIGNAL_KINDS.map(({ kind, label }) => (
        <SignalRing key={kind} kind={kind} label={label} score={day[kind]} />
      ))}
    </Card>
  );
}

function DonutRing({ progress }: { progress: number }) {
  const size = 24;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(progress, 0.05));

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.inputFill} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={C.calorieAccent}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - c * p}
        style={{ transition: "stroke-dashoffset 700ms ease-out" }}
      />
    </svg>
  );
}

function MacroCell({ name, eaten, goal }: { name: string; eaten: number; goal: number }) {
  const shown = useCountTo(eaten);
  return (
    <div className="flex min-w-0 flex-1 items-center justify-center">
      <div className="flex min-w-0 items-center gap-2">
        <DonutRing progress={eaten / goal} />
        <div className="min-w-0">
          <p className="text-sm font-bold leading-[21px] text-black" style={dmSans}>
            {name}
          </p>
          <p
            className="text-xs font-medium leading-[18px]"
            style={{ ...dmSans, color: C.textSecondary }}
          >
            {shown}/{goal}g
          </p>
        </div>
      </div>
    </div>
  );
}

function MacroGroupDivider() {
  return (
    <div className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
      <div className="h-4 w-0.5" style={{ backgroundColor: C.border }} />
    </div>
  );
}

function NutritionCard({ day }: { day: LogDay }) {
  const consumed = useCountTo(day.calories);
  const left = LOG_GOALS.calories - consumed;
  const fillWidth = `${Math.max(4, Math.round((day.calories / LOG_GOALS.calories) * 100))}%`;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <PrepItIcon name="fire" size={40} color={C.calorieAccent} />
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-medium leading-[18px]"
              style={{ ...dmSans, color: C.textSecondary }}
            >
              Eaten
            </p>
            <p className="mt-0.5 leading-none text-black">
              <span className="text-2xl font-semibold" style={brand}>
                {consumed.toLocaleString()}{" "}
              </span>
              <span className="text-base font-medium" style={{ ...dmSans, color: C.textTertiary }}>
                kcal
              </span>
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-1 text-xs font-medium"
            style={{ ...dmSans, color: C.onTrackText, backgroundColor: C.onTrackBg }}
          >
            On track
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Burned", value: 0 },
          { label: "Left", value: left },
          { label: "Goal", value: LOG_GOALS.calories },
        ].map((stat) => (
          <div key={stat.label}>
            <p
              className="text-xs font-medium leading-[18px]"
              style={{ ...dmSans, color: C.textSecondary }}
            >
              {stat.label}
            </p>
            <p className="mt-0.5 leading-none text-black">
              <span className="text-lg font-semibold" style={brand}>
                {stat.value.toLocaleString()}{" "}
              </span>
              <span className="text-xs font-medium" style={{ ...dmSans, color: C.textTertiary }}>
                kcal
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-4 h-4 overflow-hidden rounded" style={{ backgroundColor: C.inputFill }}>
        <div
          className="absolute inset-y-0 left-0 rounded"
          style={{
            width: fillWidth,
            background: "linear-gradient(90deg, #FF644F 0%, #FFBFB7 100%)",
            transition: "width 700ms ease-out",
          }}
        />
      </div>

      <div className="mt-4 flex items-center">
        <MacroCell name="Carbs" eaten={day.carbs} goal={LOG_GOALS.carbs} />
        <MacroGroupDivider />
        <MacroCell name="Protein" eaten={day.protein} goal={LOG_GOALS.protein} />
        <MacroGroupDivider />
        <MacroCell name="Fat" eaten={day.fat} goal={LOG_GOALS.fat} />
      </div>
    </Card>
  );
}

function WaterGlass() {
  return (
    <svg width={14} height={18} viewBox="0 0 14 18" aria-hidden>
      <path d="M1 1h12l-1.5 15.2a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8L1 1z" fill="#E3F0FF" />
      <path d="M2.2 6h9.6l-1.1 10.1a1.4 1.4 0 0 1-1.4 1.2h-4.6a1.4 1.4 0 0 1-1.4-1.2L2.2 6z" fill="#3A8DFF" />
    </svg>
  );
}

function WaterCard() {
  return (
    <div
      className="mx-4 flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-2.5"
      style={{ borderColor: C.border }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: C.inputFill }}
      >
        <WaterGlass />
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded" style={{ backgroundColor: C.inputFill }}>
        <div
          className="h-full rounded"
          style={{ width: "37.5%", background: "linear-gradient(90deg, #3A8DFF 0%, #9CCBFF 100%)" }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ ...dmSans, color: C.textSecondary }}>
        0.8 / 2 L
      </span>
      <PrepItIcon name="chevronRight" size={16} color={C.textTertiary} />
    </div>
  );
}

function CalorieChip({ kcal }: { kcal: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-1"
      style={{ backgroundColor: C.calChipBg }}
    >
      <PrepItIcon name="fire" size={12} color={C.calorieAccent} />
      <span
        className="text-[10px] font-extrabold leading-3 tabular-nums"
        style={{ ...dmSans, color: C.calChipText }}
      >
        {kcal.toLocaleString()} kcal
      </span>
    </span>
  );
}

function SignalChips({ calories, signals }: { calories: number; signals: Signals }) {
  return (
    <div className="flex flex-wrap gap-1">
      <CalorieChip kcal={calories} />
      {SIGNAL_KINDS.map(({ kind }) => {
        const delta = signals[kind];
        const color = deltaColor(delta);
        return (
          <span
            key={kind}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1"
            style={{ backgroundColor: C.inputFill }}
          >
            <SignalIcon kind={kind} size={12} color={color} />
            <span
              className="text-[10px] font-extrabold leading-3 tabular-nums"
              style={{ ...dmSans, color }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function SkeletonChips() {
  return (
    <div className="flex flex-1 animate-pulse gap-1">
      {[64, 40, 40, 40].map((w, i) => (
        <span
          key={i}
          className="h-5 rounded-full"
          style={{ width: w, backgroundColor: C.border }}
        />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2"
      style={{ borderColor: C.border, borderTopColor: C.textTertiary }}
    />
  );
}

function FoodCard({
  entry,
  resolved,
  typedText,
}: {
  entry: LogEntry;
  resolved: boolean;
  typedText?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-3" style={{ borderColor: C.border }}>
      <p className="text-sm font-medium leading-[21px] text-black" style={dmSans}>
        {resolved ? entry.title : (typedText ?? entry.title)}
      </p>
      <div className="mt-2">
        {resolved ? (
          <div className="nl-demo-fade">
            <SignalChips calories={entry.calories} signals={entry.signals} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Spinner />
            <SkeletonChips />
          </div>
        )}
      </div>
    </div>
  );
}

function HourRow({
  entry,
  resolved,
  joinsNext,
  typedText,
}: {
  entry: LogEntry;
  resolved: boolean;
  joinsNext: boolean;
  typedText?: string;
}) {
  const totals = resolved
    ? `${entry.calories} kcal · ${entry.carbs}g C · ${entry.protein}g P · ${entry.fat}g F`
    : "0 kcal · 0g C · 0g P · 0g F (calculating…)";

  return (
    <div className="flex gap-2" style={{ paddingBottom: joinsNext ? 16 : 0 }}>
      <div className="relative w-11 shrink-0">
        <span
          className="block text-right text-xs font-medium leading-[18px]"
          style={{ ...dmSans, color: C.textSecondary }}
        >
          {entry.hourLabel}
        </span>
        {joinsNext && (
          <div
            className="absolute bottom-[-16px] left-1/2 top-6 border-l-2 border-dotted"
            style={{ borderColor: C.borderStrong }}
            aria-hidden
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <span
            className="shrink-0 text-xs font-medium leading-[18px]"
            style={{ ...dmSans, color: C.textBody }}
          >
            {entry.timeLabel}
          </span>
          <span
            className="text-right text-xs font-medium leading-[18px]"
            style={{ ...dmSans, color: C.textBody }}
          >
            {totals}
          </span>
        </div>
        <FoodCard entry={entry} resolved={resolved} typedText={typedText} />
      </div>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"
        stroke={C.textPrimary}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogCard({
  showLunch,
  lunchResolved,
  lunchTypedText,
  lunchRef,
}: {
  showLunch: boolean;
  lunchResolved: boolean;
  lunchTypedText?: string;
  lunchRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <Card className="px-3 pb-4 pt-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <p className="flex-1 text-xl font-semibold leading-[30px] text-black" style={brand}>
          Log
        </p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: C.inputFill }}
        >
          <ExpandIcon />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
          <PrepItIcon name="plus" size={14} color="#ffffff" />
        </div>
      </div>
      <HourRow entry={BREAKFAST} resolved joinsNext={showLunch} />
      {showLunch && (
        <div ref={lunchRef} className="nl-demo-fade">
          <HourRow
            entry={LUNCH}
            resolved={lunchResolved}
            joinsNext={false}
            typedText={lunchTypedText}
          />
        </div>
      )}
    </Card>
  );
}

/** The Log tab in 390pt design units: rings, nutrition, water, and the hourly Log. */
export function LogScreen({
  showLunch = false,
  lunchResolved = false,
  lunchTypedText,
  focusLunch = false,
  day = DAY_BEFORE,
}: {
  showLunch?: boolean;
  lunchResolved?: boolean;
  lunchTypedText?: string;
  focusLunch?: boolean;
  day?: LogDay;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const lunchRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const lunch = lunchRef.current;
    if (!focusLunch || !content || !lunch) {
      setScrollY(0);
      return;
    }
    const contentRect = content.getBoundingClientRect();
    const scale = contentRect.width / DESIGN_WIDTH || 1;
    const lunchBottom =
      content.offsetTop + (lunch.getBoundingClientRect().bottom - contentRect.top) / scale;
    const visibleBottom = DESIGN_HEIGHT - HOME_INDICATOR - 24;
    setScrollY(Math.max(0, lunchBottom - visibleBottom));
  }, [focusLunch, showLunch, lunchResolved]);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, backgroundColor: C.scaffold }}
    >
      <div className="relative z-10" style={{ paddingTop: STATUS_BAR, backgroundColor: C.scaffold }}>
        <LogHeader />
      </div>
      <div
        ref={contentRef}
        className="flex flex-col gap-3 pb-10 pt-1"
        style={{
          transform: `translateY(${-scrollY}px)`,
          transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <SignalRingsCard day={day} />
        <NutritionCard day={day} />
        <WaterCard />
        <LogCard
          showLunch={showLunch}
          lunchResolved={lunchResolved}
          lunchTypedText={lunchTypedText}
          lunchRef={lunchRef}
        />
      </div>
    </div>
  );
}

/** Scales 390×844 design units to fill the phone's inner screen. */
export function DesignCanvas({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(288 / DESIGN_WIDTH);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setScale(node.clientWidth / DESIGN_WIDTH || 288 / DESIGN_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden" style={{ backgroundColor: C.scaffold }}>
      <div
        className="pointer-events-none relative origin-top-left select-none"
        style={{ transform: `scale(${scale})`, width: DESIGN_WIDTH, height: DESIGN_HEIGHT }}
        aria-hidden
      >
        {children}
      </div>
    </div>
  );
}

export default function FakeLogScreenDemo() {
  return (
    <DesignCanvas>
      <LogScreen />
    </DesignCanvas>
  );
}
