"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;
const SCALE = 288 / DESIGN_WIDTH;

const SCROLL_DELAY_MS = 800;
const SCROLL_DURATION_MS = 1600;

const C = {
  scaffold: "#F4F4F5",
  surface: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#7A7A82",
  textTertiary: "#A6A6AC",
  border: "#E9E9EA",
  inputFill: "#F4F4F5",
  calorieAccent: "#FF644F",
  success: "#258400",
} as const;

const PREVIEW = {
  title: "Chicken wrap, an apple and a flat white",
  calories: 487,
  carbs: 42,
  protein: 26,
  fats: 19,
  confidence: 0.78,
  estimationNotes:
    "Assumed a standard café chicken wrap (~280g). One medium apple (~182g). Regular flat white with whole milk (~240ml).",
  items: [
    { name: "Chicken wrap", calories: 385, carbs: 32, protein: 22, fats: 14 },
    { name: "Apple", calories: 52, carbs: 14, protein: 0, fats: 0 },
    { name: "Flat white", calories: 50, carbs: 4, protein: 4, fats: 2 },
  ],
} as const;

function SemiCircleConfidenceGauge({
  progress,
  accentColor,
  percentLabel,
}: {
  progress: number;
  accentColor: string;
  percentLabel: string;
}) {
  const width = 120;
  const height = 60;
  const stroke = 8;
  const r = (width - stroke) / 2;
  const cx = width / 2;
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
          stroke={C.border}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          stroke={accentColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLength}`}
        />
      </svg>
      <p
        className="absolute inset-x-0 top-[26px] text-center text-[28px] font-semibold leading-[34px] text-black"
        style={{ fontFamily: "var(--font-brand)" }}
      >
        {percentLabel}
      </p>
    </div>
  );
}

function IconCircleButton({ icon }: { icon: "chevronLeft" | "menuDots" }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
      <PrepItIcon name={icon} size={24} color={C.textPrimary} />
    </div>
  );
}

function NutritionStatsRow() {
  const stats = [
    { value: PREVIEW.calories.toLocaleString(), label: "Calories" },
    { value: `${PREVIEW.carbs}g`, label: "Carbs" },
    { value: `${PREVIEW.protein}g`, label: "Protein" },
    { value: `${PREVIEW.fats}g`, label: "Fat" },
  ];

  return (
    <div className="flex gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex min-w-0 flex-1 flex-col items-center rounded-2xl bg-white px-2 py-2"
        >
          <p
            className="text-lg font-bold leading-none text-black"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {stat.value}
          </p>
          <p
            className="mt-1 text-xs font-medium text-black"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function QtyStepper() {
  return (
    <div className="flex h-14 items-center rounded-2xl bg-white px-2">
      <div className="flex flex-1 justify-center">
        <PrepItIcon name="minus" size={24} color={C.textPrimary} />
      </div>
      <div className="flex flex-[2] justify-center">
        <span
          className="text-base font-medium text-black"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          1
        </span>
      </div>
      <div className="flex flex-1 justify-center">
        <PrepItIcon name="plus" size={24} color={C.textPrimary} />
      </div>
    </div>
  );
}

function ItemMacroRow({
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
  const macroStyle = {
    fontFamily: "var(--font-dm-sans)",
    color: C.textSecondary,
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 text-xs font-bold leading-[18px]"
      style={macroStyle}
    >
      <span className="inline-flex items-center gap-1" style={{ color: C.calorieAccent }}>
        <PrepItIcon name="fire" size={14} color={C.calorieAccent} />
        {calories} cal
      </span>
      <span>•</span>
      <span>C {carbs}g</span>
      <span>•</span>
      <span>P {protein}g</span>
      <span>•</span>
      <span>F {fats}g</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3
      className="text-xl font-semibold leading-[30px] text-black"
      style={{ fontFamily: "var(--font-brand)" }}
    >
      {children}
    </h3>
  );
}

function ReviewFooter() {
  return (
    <div
      className="shrink-0 border-t bg-white px-2 pb-[34px] pt-4"
      style={{ borderColor: C.border }}
    >
      <div className="flex gap-2">
        <div
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl py-3.5"
          style={{ backgroundColor: C.inputFill }}
        >
          <PrepItIcon name="sparkles" size={18} color={C.textPrimary} />
          <span
            className="text-base font-bold text-black"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Update
          </span>
        </div>
        <div className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-black py-3.5">
          <PrepItIcon name="appleLogo" size={22} color="#ffffff" />
          <span
            className="text-base font-bold text-white"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Add to Log
          </span>
        </div>
      </div>
    </div>
  );
}

function ReviewContent() {
  const confidencePct = Math.round(PREVIEW.confidence * 100);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const estimationRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useLayoutEffect(() => {
    setScrollY(0);

    const viewport = viewportRef.current;
    const content = contentRef.current;
    const estimation = estimationRef.current;
    if (!viewport || !content || !estimation) return;

    const targetScroll = Math.max(0, estimation.offsetTop - 20);
    const maxScroll = Math.max(0, content.offsetHeight - viewport.clientHeight);
    const clampedScroll = Math.min(targetScroll, maxScroll);

    const timer = window.setTimeout(() => {
      setScrollY(clampedScroll);
    }, SCROLL_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#F4F4F5]">
      <div className="pt-[47px]">
        <div className="flex h-10 items-center px-4 pb-3 pt-3">
          <IconCircleButton icon="chevronLeft" />
          <div className="flex-1" />
          <IconCircleButton icon="menuDots" />
        </div>
      </div>

      <div ref={viewportRef} className="min-h-0 flex-1 overflow-hidden">
        <div
          ref={contentRef}
          className="px-4 pt-4 pb-8 ease-in-out will-change-transform"
          style={{
            transform: scrollY ? `translateY(-${scrollY}px)` : undefined,
            transition: scrollY
              ? `transform ${SCROLL_DURATION_MS}ms ease-in-out`
              : undefined,
          }}
        >
          <SectionTitle>{PREVIEW.title}</SectionTitle>

          <div className="mt-4">
            <NutritionStatsRow />
          </div>

          <div className="mt-4">
            <QtyStepper />
          </div>

          <div className="mt-8">
            <SectionTitle>Meal items</SectionTitle>
            <div className="mt-4 rounded-2xl bg-white p-4">
              {PREVIEW.items.map((item, index) => (
                <div key={item.name} className={index < PREVIEW.items.length - 1 ? "mb-4" : ""}>
                  <p
                    className="text-sm font-medium leading-[21px] text-black"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    {item.name}
                  </p>
                  <div className="mt-2">
                    <ItemMacroRow
                      calories={item.calories}
                      carbs={item.carbs}
                      protein={item.protein}
                      fats={item.fats}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div ref={estimationRef} className="mt-8">
            <SectionTitle>How it&apos;s calculated</SectionTitle>
            <p
              className="mt-1 text-base leading-6"
              style={{ fontFamily: "var(--font-dm-sans)", color: C.textSecondary }}
            >
              Amount, brand, and restaurant details help improve accuracy.{" "}
              <span className="font-bold text-black underline">Learn more</span>
            </p>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <div className="flex items-center gap-6">
                <SemiCircleConfidenceGauge
                  progress={PREVIEW.confidence}
                  accentColor={C.success}
                  percentLabel={`${confidencePct}`}
                />
                <div>
                  <p
                    className="text-xl font-bold leading-[30px] text-black"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    High
                  </p>
                  <p
                    className="text-sm font-medium leading-[21px]"
                    style={{ fontFamily: "var(--font-dm-sans)", color: C.textSecondary }}
                  >
                    Confidence Level
                  </p>
                </div>
              </div>

              <p
                className="mt-4 text-sm leading-[21px] text-black"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {PREVIEW.estimationNotes}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ReviewFooter />
    </div>
  );
}

export default function NlReviewScreenDemo() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F4F4F5]">
      <div
        className="pointer-events-none select-none"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
        }}
        aria-hidden
      >
        <ReviewContent />
      </div>
    </div>
  );
}
