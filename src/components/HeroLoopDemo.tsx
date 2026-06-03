"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import FactorInsightCard, {
  type FactorInsight,
} from "@/components/signals/FactorInsightCard";
import SignalRing from "@/components/signals/SignalRing";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const MEAL_TEXT = "chicken wrap, an apple and a flat white";

const MEAL = {
  title: "Chicken wrap, an apple and a flat white",
  calories: 487,
  carbs: 42,
  protein: 26,
  fats: 19,
  confidence: 0.78,
  estimationNotes:
    "Assumed a standard café chicken wrap (~280g). One medium apple (~182g). Regular flat white with whole milk (~240ml).",
  items: [
    { name: "Chicken wrap", calories: 385 },
    { name: "Apple", calories: 52 },
    { name: "Flat white", calories: 50 },
  ],
} as const;

const SIGNALS = [
  { label: "Energy", score: 68 },
  { label: "Satiety", score: 52 },
  { label: "Mood", score: 71 },
] as const;

const FACTOR_STACK: (FactorInsight & { stackClass: string })[] = [
  {
    label: "Glycaemic quality",
    summary: "Moderate GL from wrap + flat white",
    component: 0.42,
    baselineComponent: 0.55,
    weight: 0.18,
    stackClass:
      "relative z-10 mx-4 rotate-[-2.5deg] shadow-[0_1px_6px_rgba(0,0,0,0.06)]",
  },
  {
    label: "Fibre",
    summary: "12g / 30g toward benchmark",
    component: 0.45,
    weight: 0.25,
    stackClass:
      "relative z-20 mx-2 rotate-[1.2deg] shadow-[0_2px_10px_rgba(0,0,0,0.07)]",
  },
  {
    label: "Protein",
    summary: "28g / 120g expected",
    component: 0.38,
    baselineComponent: 0.52,
    weight: 0.28,
    stackClass: "relative z-30 shadow-[0_6px_20px_rgba(0,0,0,0.12)]",
  },
];

type Phase = "log" | "meal" | "signals" | "insight" | "chat";

const CHAT = {
  userMessage: "Why is my afternoon energy soft after this lunch?",
  assistantMessage:
    "Your wrap and flat white are light on protein, which can leave Energy dipping mid-afternoon. A Greek yogurt now adds ~15g protein and helps hold Satiety until dinner.",
} as const;

const TYPE_MS = 55;
const PRE_TYPE_MS = 700;
const LOG_HOLD_MS = 2600;
const MEAL_MS = 5500;
const SIGNALS_RINGS_HOLD_MS = 2000;
const SIGNAL_FACTOR_HOLD_MS = 1600;
const INSIGHT_HOLD_MS = 5200;
const INSIGHT_TAP_MS = 380;
const CHAT_THINK_MS = 900;
const CHAT_STREAM_MS = 16;
const CHAT_HOLD_MS = 5000;
const FADE_MS = 600;

function LogSheet({ text, typing }: { text: string; typing: boolean }) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--grey-10)] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
      <div className="flex flex-col px-3 pb-3 pt-2">
        <div className="mb-2 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-[#D3D3D5]" />
        </div>
        <h3 className="text-base font-semibold leading-6 text-[var(--black-100)]">
          Describe your meal
        </h3>
        <p className="mt-0.5 text-xs leading-4 text-[var(--grey-60)]">
          Amount, brand, and restaurant details help improve accuracy.
        </p>
        <div className="mt-2.5 flex items-end gap-1.5">
          <div className="min-h-[36px] flex-1 rounded-xl bg-[var(--grey-5)] px-3 py-2">
            <p className="min-h-[20px] text-sm leading-5 text-[var(--black-100)]">
              {text}
              {typing && (
                <span className="ml-px inline-block h-[14px] w-0.5 translate-y-0.5 animate-pulse bg-[var(--black-100)]" />
              )}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--black-100)]">
            <PrepItIcon name="arrowUp" size={20} color="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MacroChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center rounded-xl bg-[var(--grey-5)] px-1.5 py-2">
      <p
        className="text-base font-bold leading-none text-[var(--black-100)]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-[var(--grey-60)]">
        {label}
      </p>
    </div>
  );
}

function SemiCircleConfidenceGauge({
  progress,
  percentLabel,
}: {
  progress: number;
  percentLabel: string;
}) {
  const width = 88;
  const height = 44;
  const stroke = 6;
  const r = (width - stroke) / 2;
  const cy = height;
  const arcLength = Math.PI * r;
  const filled = arcLength * Math.min(1, Math.max(0, progress));
  const path = `M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${width - stroke / 2} ${cy}`;

  return (
    <div className="relative shrink-0" style={{ width, height }} aria-hidden>
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={path}
          fill="none"
          stroke="var(--grey-10)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          stroke="#258400"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLength}`}
        />
      </svg>
      <p
        className="absolute inset-x-0 top-[18px] text-center text-xl font-semibold leading-6 text-[var(--black-100)]"
        style={{ fontFamily: "var(--font-brand)" }}
      >
        {percentLabel}
      </p>
    </div>
  );
}

function MealCard() {
  const confidencePct = Math.round(MEAL.confidence * 100);

  return (
    <div className="mx-auto w-full max-w-[340px] rounded-2xl bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.16)]">
      <p
        className="text-base font-semibold leading-6 text-[var(--black-100)]"
        style={{ fontFamily: "var(--font-brand)" }}
      >
        {MEAL.title}
      </p>
      <div className="mt-3 flex gap-2">
        <MacroChip value={MEAL.calories.toLocaleString()} label="Calories" />
        <MacroChip value={`${MEAL.carbs}g`} label="Carbs" />
        <MacroChip value={`${MEAL.protein}g`} label="Protein" />
        <MacroChip value={`${MEAL.fats}g`} label="Fat" />
      </div>
      <div className="mt-3.5 flex flex-col gap-2.5">
        {MEAL.items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-2"
          >
            <p className="min-w-0 truncate text-sm font-medium text-[var(--black-100)]">
              {item.name}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--coral-100)]">
              <PrepItIcon name="fire" size={13} color="var(--coral-100)" />
              {item.calories} cal
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3.5 border-t border-[var(--grey-10)] pt-3.5">
        <div className="flex items-center gap-4">
          <SemiCircleConfidenceGauge
            progress={MEAL.confidence}
            percentLabel={`${confidencePct}`}
          />
          <div>
            <p
              className="text-base font-bold leading-6 text-[var(--black-100)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              High
            </p>
            <p className="text-xs font-medium leading-4 text-[var(--grey-60)]">
              Confidence Level
            </p>
          </div>
        </div>
        <p
          className="mt-3 text-xs leading-[18px] text-[var(--black-100)]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {MEAL.estimationNotes}
        </p>
      </div>
    </div>
  );
}

function SignalsCard({
  revealCount,
  animKey,
}: {
  revealCount: number;
  animKey: number;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="relative z-40 rounded-2xl bg-white px-3 pb-3 pt-4 shadow-[0_12px_36px_rgba(0,0,0,0.16)]">
        <div
          key={`rings-${animKey}`}
          className="flex items-start justify-evenly gap-1 nl-demo-fade"
        >
          {SIGNALS.map((signal, index) => (
            <div
              key={signal.label}
              className="flex min-w-0 flex-1 flex-col items-center"
            >
              <SignalRing
                score={signal.score}
                label=""
                animate
                delayMs={index * 100}
                size={66}
                showScoreOnly
              />
              <span className="mt-1.5 inline-flex items-center gap-0.5 text-[13px] font-medium text-[var(--grey-80)]">
                {signal.label}
                <PrepItIcon
                  name="chevronRight"
                  size={12}
                  color="var(--grey-40)"
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative -mt-4 px-1 pt-2">
        {FACTOR_STACK.map((factor, index) => {
          const visible = index < revealCount;

          return (
            <div
              key={`${animKey}-${factor.label}`}
              className={`hero-factor-stack-item${
                visible ? " hero-factor-stack-item--visible" : ""
              }${index > 0 ? " hero-factor-stack-item--overlap" : ""}`}
            >
              <div className="hero-factor-stack-item-inner">
                <div className={`hero-factor-stack-item-content ${factor.stackClass}`}>
                  <FactorInsightCard factor={factor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightCard({ chipTapped }: { chipTapped: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[340px] pb-3.5">
      <div
        className="rounded-2xl p-[2px] shadow-[0_12px_36px_rgba(0,0,0,0.16)]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--gradient-blue) 0%, var(--gradient-purple) 31%, var(--gradient-orange) 63%, var(--gradient-yellow) 97.5%)",
        }}
      >
        <div
          className="rounded-[14px] px-4 pb-7 pt-4"
          style={{
            backgroundImage:
              "linear-gradient(90deg, color-mix(in srgb, var(--gradient-blue) 10%, #ffffff) 0%, color-mix(in srgb, var(--gradient-purple) 10%, #ffffff) 31%, color-mix(in srgb, var(--gradient-orange) 10%, #ffffff) 63%, color-mix(in srgb, var(--gradient-yellow) 10%, #ffffff) 97.5%)",
          }}
        >
          <div className="flex items-center gap-2">
            <PrepItIcon name="sparkles" size={18} color="var(--black-100)" />
            <p className="text-sm font-bold leading-5 text-[var(--black-100)]">
              Afternoon Energy looks soft
            </p>
          </div>
          <p className="mt-2 text-xs font-medium leading-5 text-[var(--grey-80)]">
            Your wrap and flat white are light on protein. A Greek yogurt now
            would help hold Satiety until dinner.
          </p>
        </div>
      </div>

      <div className="absolute right-3 -bottom-2" aria-hidden>
        <div
          className={`flex items-center gap-2 rounded-full bg-[var(--black-100)] px-4 py-2.5 text-xs font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]${
            chipTapped ? " hero-explore-chip-tap" : ""
          }`}
        >
          Explore this deeper
          <PrepItIcon name="arrowRight" size={12} color="#ffffff" />
        </div>
      </div>
    </div>
  );
}

function ChatSheet({
  userMessage,
  assistantText,
  thinking,
}: {
  userMessage: string;
  assistantText: string;
  thinking: boolean;
}) {
  return (
    <div className="flex max-h-[min(72vw,300px)] min-h-[240px] w-full flex-col overflow-hidden rounded-2xl border border-[var(--grey-10)] bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
      <div className="shrink-0 bg-white pt-2">
        <div className="flex justify-center pb-2">
          <div className="h-1 w-10 rounded-full bg-[#D3D3D5]" />
        </div>
        <div className="flex items-center gap-1.5 px-3 pb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--grey-5)]">
            <PrepItIcon name="history" size={14} color="var(--black-100)" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
            <Image
              src="/logo.png"
              alt=""
              width={18}
              height={18}
              className="rounded-[5px]"
            />
            <span className="text-sm font-bold leading-5 text-[var(--black-100)]">
              Nutritionist
            </span>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--grey-5)]">
            <PrepItIcon name="edit" size={14} color="var(--black-100)" />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-3 pt-1 pb-5">
        <div className="flex justify-end pb-2.5">
          <div className="max-w-[88%] rounded-xl rounded-br-[2px] bg-[var(--grey-5)] px-3 py-2.5">
            <p className="text-xs leading-[18px] text-[var(--black-100)]">
              {userMessage}
            </p>
          </div>
        </div>
        {thinking && (
          <p className="ai-chat-thinking text-xs leading-[18px]">Thinking...</p>
        )}
        {!thinking && assistantText && (
          <p className="pb-2 text-xs leading-[18px] text-[var(--black-100)]">
            {assistantText}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-[var(--grey-10)] bg-white px-3 pb-3 pt-2">
        <div className="flex items-end gap-1.5">
          <div className="min-h-[36px] flex-1 rounded-xl bg-[var(--grey-5)] px-3 py-2">
            <p className="text-xs leading-[18px] text-[var(--grey-60)]">
              Ask about your nutrition...
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--grey-10)]">
            <PrepItIcon name="arrowUp" size={14} color="var(--grey-40)" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroLoopDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("log");
  const [typed, setTyped] = useState("");
  const [chatStreamed, setChatStreamed] = useState("");
  const [chatThinking, setChatThinking] = useState(false);
  const [signalsRevealCount, setSignalsRevealCount] = useState(0);
  const [signalsAnimKey, setSignalsAnimKey] = useState(0);
  const [exploreChipTapped, setExploreChipTapped] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const run = async () => {
      while (!cancelled) {
        setPhase("log");
        setTyped("");
        await wait(PRE_TYPE_MS);

        for (let i = 1; i <= MEAL_TEXT.length; i += 1) {
          if (cancelled) return;
          setTyped(MEAL_TEXT.slice(0, i));
          await wait(TYPE_MS);
        }

        if (cancelled) return;
        await wait(LOG_HOLD_MS);

        if (cancelled) return;
        setPhase("meal");
        await wait(MEAL_MS);

        if (cancelled) return;
        setPhase("signals");
        setSignalsRevealCount(0);
        setSignalsAnimKey((key) => key + 1);
        await wait(SIGNALS_RINGS_HOLD_MS);

        for (let i = 1; i <= FACTOR_STACK.length; i += 1) {
          if (cancelled) return;
          setSignalsRevealCount(i);
          await wait(SIGNAL_FACTOR_HOLD_MS);
        }

        if (cancelled) return;
        setPhase("insight");
        setExploreChipTapped(false);
        await wait(INSIGHT_HOLD_MS);

        if (cancelled) return;
        setExploreChipTapped(true);
        await wait(INSIGHT_TAP_MS);

        if (cancelled) return;
        setPhase("chat");
        setChatStreamed("");
        setChatThinking(true);
        await wait(CHAT_THINK_MS);

        if (cancelled) return;
        setChatThinking(false);
        for (let i = 1; i <= CHAT.assistantMessage.length; i += 1) {
          if (cancelled) return;
          setChatStreamed(CHAT.assistantMessage.slice(0, i));
          await wait(CHAT_STREAM_MS);
        }

        if (cancelled) return;
        await wait(CHAT_HOLD_MS);
      }
    };

    void run();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [active]);

  const layers: { id: Phase; node: ReactNode }[] = [
    { id: "log", node: <LogSheet text={typed} typing={phase === "log"} /> },
    { id: "meal", node: <MealCard /> },
    { id: "signals", node: <SignalsCard revealCount={signalsRevealCount} animKey={signalsAnimKey} /> },
    { id: "insight", node: <InsightCard chipTapped={exploreChipTapped} /> },
    {
      id: "chat",
      node: (
        <ChatSheet
          userMessage={CHAT.userMessage}
          assistantText={chatStreamed}
          thinking={chatThinking}
        />
      ),
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full" aria-hidden="true">
      {layers.map((layer) => {
        const isActive = layer.id === phase;
        return (
          <div
            key={layer.id}
            className="absolute inset-x-0 bottom-0 ease-out"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? "translateY(0)" : "translateY(10px)",
              transition: `opacity ${FADE_MS}ms ease-out, transform ${FADE_MS}ms ease-out`,
              zIndex: isActive ? 20 : 10,
              pointerEvents: "none",
            }}
          >
            {layer.node}
          </div>
        );
      })}
    </div>
  );
}
