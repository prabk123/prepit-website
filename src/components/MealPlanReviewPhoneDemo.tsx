"use client";

import { useEffect, useRef, useState } from "react";
import PrepItIcon from "@/components/shareable/PrepItIcon";
import {
  PhoneDemoShell,
  ScaledDesign,
} from "@/components/phoneDemo/PhoneDemoShell";

const DATA = {
  focusNote:
    "We are prioritizing high-protein staples you already enjoy to curb evening grazing and keep you satisfied longer.",
  breakfast: {
    title: "High Protein Greek Yogurt",
    calories: 264,
    carbs: 27,
    protein: 24,
    fats: 7,
    why: "Sticking to the same breakfast rhythm to build a stable habit before work.",
  },
  lunch: {
    title: "Chicken quinoa bowl",
    calories: 520,
    carbs: 48,
    protein: 42,
    fats: 14,
    why: "Higher protein lunch to carry you through the afternoon.",
  },
  items: [
    { name: "Greek yogurt", amount: "170g", cal: 100 },
    { name: "Blueberries", amount: "80g", cal: 46 },
    { name: "Honey", amount: "1 tsp", cal: 21 },
    { name: "Almonds", amount: "10g", cal: 58 },
  ],
  prepSteps: [
    "Spoon the yogurt into a bowl.",
    "Top with blueberries and almonds.",
    "Drizzle honey and serve cold.",
  ],
  dailyTargetCal: 1570,
  plannedCal: 1562,
  weekStart: new Date(2026, 6, 20),
  selectedOffset: 1,
} as const;

type Phase =
  | "overview"
  | "highlightMeal"
  | "detail"
  | "cooking"
  | "confirm"
  | "saving"
  | "created";

const HOLD = {
  overview: 1800,
  highlightMeal: 700,
  detail: 1800,
  cooking: 2000,
  confirm: 800,
  saving: 1200,
  created: 2200,
  reset: 400,
} as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,100,79,0.1)] px-1.5 py-[3px]">
        <PrepItIcon name="fire" size={11} color="#FF644F" />
        <span className="text-[10px] font-extrabold leading-3 text-[#B24637]">
          {calories.toLocaleString()} kcal
        </span>
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
          className="rounded-full bg-[#F4F4F5] px-1.5 py-[3px] text-[10px] leading-3 text-black"
        >
          <span className="font-extrabold">{letter}</span>
          <span className="font-medium"> {grams}g</span>
        </span>
      ))}
    </div>
  );
}

function InsightNote({ text }: { text: string }) {
  return (
    <div
      className="rounded-2xl p-[2px]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--gradient-blue) 0%, var(--gradient-purple) 31%, var(--gradient-orange) 63%, var(--gradient-yellow) 97.5%)",
      }}
    >
      <div
        className="flex gap-2 rounded-[14px] px-3 py-2.5"
        style={{
          backgroundImage:
            "linear-gradient(90deg, color-mix(in srgb, var(--gradient-blue) 10%, #ffffff) 0%, color-mix(in srgb, var(--gradient-purple) 10%, #ffffff) 31%, color-mix(in srgb, var(--gradient-orange) 10%, #ffffff) 63%, color-mix(in srgb, var(--gradient-yellow) 10%, #ffffff) 97.5%)",
        }}
      >
        <PrepItIcon name="sparkles" size={16} color="#000000" />
        <p className="text-xs font-medium leading-[17px] text-[#4D4D59]">{text}</p>
      </div>
    </div>
  );
}

function MealCard({
  title,
  calories,
  carbs,
  protein,
  fats,
  why,
  highlighted,
}: {
  title: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  why: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] border bg-white p-3 ${
        highlighted ? "scale-[0.98] border-black" : "border-[#D3D3D5]"
      }`}
      style={{ transition: "transform 180ms ease, border-color 180ms ease" }}
    >
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-[13px] font-medium leading-[19px] text-black">
          {title}
        </p>
        <PrepItIcon name="swap" size={16} color="#FF644F" />
      </div>
      <div className="mt-2">
        <MacroChips calories={calories} carbs={carbs} protein={protein} fats={fats} />
      </div>
      <div className="mt-2.5 flex items-start gap-1.5">
        <PrepItIcon name="sparkles" size={14} color="#000000" />
        <p className="text-[10px] leading-[14px] text-[#4D4D59]">{why}</p>
      </div>
    </div>
  );
}

function FilledIcon({ name }: { name: "chevronLeft" | "close" }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
      <PrepItIcon name={name} size={16} color="#000000" />
    </div>
  );
}

function PlanOverview({
  highlightMeal,
  highlightConfirm,
  confirming,
}: {
  highlightMeal: boolean;
  highlightConfirm: boolean;
  confirming: boolean;
}) {
  return (
    <div className="flex h-[844px] flex-col bg-[#F4F4F5] pt-[47px]">
      <div className="relative mx-3 flex h-10 items-center">
        <FilledIcon name="chevronLeft" />
        <p className="absolute inset-x-0 text-center text-[13px] font-bold text-black">
          Create Meal Plan
        </p>
        <div className="ml-auto">
          <FilledIcon name="close" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-3 pb-2">
        <div className="mt-1.5">
          <InsightNote text={DATA.focusNote} />
        </div>

        <div className="mt-2 rounded-[14px] border border-[#E9E9EA] bg-white p-2.5">
          <div className="flex justify-around">
            {WEEKDAYS.map((day, index) => {
              const date = DATA.weekStart.getDate() + index;
              const selected = index === DATA.selectedOffset;
              return (
                <div key={day} className="flex flex-col items-center">
                  <p
                    className={`text-[9px] ${selected ? "font-bold" : "font-normal"} text-black`}
                  >
                    {day}
                  </p>
                  <div
                    className={`mt-1.5 flex h-[30px] w-[30px] items-center justify-center rounded-full text-xs ${
                      selected ? "bg-black font-bold text-white" : "font-medium text-black"
                    }`}
                  >
                    {date}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 rounded-xl bg-[#F4F4F5] px-2.5 py-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-black">Daily target</p>
              <p className="text-[10px] text-black">
                {DATA.dailyTargetCal.toLocaleString()} kcal
              </p>
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <p className="text-[10px] font-bold text-black">Tuesday, 21 Jul</p>
              <div className="flex items-center gap-1">
                <PrepItIcon name="fire" size={12} color="#FF644F" />
                <p className="text-[11px] font-bold text-black">
                  {DATA.plannedCal.toLocaleString()} kcal
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2 rounded-[14px] border border-[#E9E9EA] bg-white p-3">
          <p className="text-xs font-bold text-[#4D4D59]">Breakfast</p>
          <div className="mt-1.5">
            <MealCard {...DATA.breakfast} highlighted={highlightMeal} />
          </div>
          <p className="mt-4 text-xs font-bold text-[#4D4D59]">Lunch</p>
          <div className="mt-1.5">
            <MealCard {...DATA.lunch} />
          </div>
        </div>
      </div>

      <div className="border-t border-[#E9E9EA] bg-white px-3 pb-3 pt-2.5">
        <div className="mb-3 flex items-center justify-between text-xs font-bold text-black">
          <span className="flex items-center gap-1">
            <PrepItIcon name="chevronLeft" size={16} color="#000000" />
            Prev Day
          </span>
          <span className="flex items-center gap-1">
            Next Day
            <PrepItIcon name="chevronRight" size={16} color="#000000" />
          </span>
        </div>
        <div className="flex gap-2">
          <div
            className="flex h-11 flex-1 items-center justify-center gap-1 rounded-[14px] p-[1.5px]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--gradient-blue) 0%, var(--gradient-purple) 31%, var(--gradient-orange) 63%, var(--gradient-yellow) 97.5%)",
            }}
          >
            <div className="flex h-full w-full items-center justify-center gap-1 rounded-[12.5px] bg-white">
              <PrepItIcon name="sparkles" size={14} color="#000000" />
              <span className="text-[11px] font-bold text-black">Ask Nutritionist</span>
            </div>
          </div>
          <div
            className={`flex h-11 flex-1 items-center justify-center rounded-[14px] bg-black text-[13px] font-bold text-white ${
              highlightConfirm && !confirming ? "scale-95" : ""
            } ${confirming ? "opacity-50" : ""}`}
          >
            {confirming ? (
              <span className="nl-loading-shimmer text-xs">Saving…</span>
            ) : (
              "Confirm"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MealDetail({ cooking }: { cooking: boolean }) {
  return (
    <div className="flex h-[844px] flex-col bg-[#F4F4F5] pt-[47px]">
      <div className="mx-3 flex h-10 items-center">
        <FilledIcon name="chevronLeft" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-3.5 pt-1">
        <p className="text-lg font-semibold leading-[26px] text-black">
          {DATA.breakfast.title}
        </p>
        <div className="mt-3 flex gap-1.5">
          {(
            [
              [DATA.breakfast.calories.toLocaleString(), "Calories"],
              [`${DATA.breakfast.carbs}g`, "Carbs"],
              [`${DATA.breakfast.protein}g`, "Protein"],
              [`${DATA.breakfast.fats}g`, "Fat"],
            ] as const
          ).map(([value, label]) => (
            <div
              key={label}
              className="flex-1 rounded-xl bg-white px-1 py-2 text-center"
            >
              <p className="text-sm font-bold text-black">{value}</p>
              <p className="text-[10px] font-medium text-black">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <InsightNote text={DATA.breakfast.why} />
        </div>
        <div className="mt-4 flex border-b border-[#E9E9EA]">
          {(["Nutrition", "Cooking"] as const).map((tab) => {
            const active = cooking ? tab === "Cooking" : tab === "Nutrition";
            return (
              <div key={tab} className="flex-1 pb-2 text-center">
                <p
                  className={`text-sm ${active ? "font-bold text-black" : "font-medium text-[#7A7A82]"}`}
                >
                  {tab}
                </p>
                {active && <div className="mx-auto mt-2 h-0.5 w-10 rounded bg-black" />}
              </div>
            );
          })}
        </div>

        {!cooking ? (
          <div className="mt-5">
            <p className="text-base font-semibold text-black">Meal items</p>
            <div className="mt-2.5 rounded-[14px] bg-white p-3">
              {DATA.items.map((item, index) => (
                <div
                  key={item.name}
                  className={`flex items-center justify-between ${index > 0 ? "mt-3" : ""}`}
                >
                  <div>
                    <p className="text-[13px] font-medium text-black">{item.name}</p>
                    <p className="text-xs text-[#7A7A82]">{item.amount}</p>
                  </div>
                  <p className="text-xs font-semibold text-black">{item.cal} kcal</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-base font-semibold text-black">Ingredients</p>
            <div className="mt-2.5 rounded-[14px] bg-white p-3">
              {DATA.items.map((item) => (
                <p key={item.name} className="py-1 text-[13px] font-medium text-black">
                  {item.amount} {item.name.toLowerCase()}
                </p>
              ))}
            </div>
            <p className="mt-5 text-base font-semibold text-black">Preparation</p>
            <div className="mt-2.5 rounded-[14px] bg-white p-3">
              {DATA.prepSteps.map((step, index) => (
                <div key={step} className="flex gap-2 py-1.5">
                  <span className="text-[13px] font-bold text-black">{index + 1}.</span>
                  <p className="text-[13px] font-medium text-black">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCreatedSheet() {
  return (
    <div className="absolute inset-0 z-20">
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-x-0 bottom-0 rounded-t-[20px] bg-white px-4 pb-8 pt-2.5 shadow-[0_-8px_40px_rgba(0,0,0,0.18)]">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#D3D3D5]" />
        <p className="text-center text-[40px] leading-none">💪</p>
        <p className="mt-3 text-center text-[17px] font-bold leading-6 text-black">
          Your plan is ready!
        </p>
        <p className="mt-1.5 text-center text-sm text-[#7A7A82]">
          One step closer to eating better & easier.
        </p>
      </div>
    </div>
  );
}

export default function MealPlanReviewPhoneDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("overview");
  const [fadeKey, setFadeKey] = useState(0);
  const [detailIn, setDetailIn] = useState(false);

  const showDetail = phase === "detail" || phase === "cooking";

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (showDetail) {
      const frame = requestAnimationFrame(() => setDetailIn(true));
      return () => cancelAnimationFrame(frame);
    }
    setDetailIn(false);
    return undefined;
  }, [showDetail]);

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
        setFadeKey((k) => k + 1);
        setPhase("overview");
        await wait(HOLD.overview);
        if (cancelled) return;
        setPhase("highlightMeal");
        await wait(HOLD.highlightMeal);
        if (cancelled) return;
        setPhase("detail");
        await wait(HOLD.detail);
        if (cancelled) return;
        setPhase("cooking");
        await wait(HOLD.cooking);
        if (cancelled) return;
        setPhase("overview");
        await wait(HOLD.overview);
        if (cancelled) return;
        setPhase("confirm");
        await wait(HOLD.confirm);
        if (cancelled) return;
        setPhase("saving");
        await wait(HOLD.saving);
        if (cancelled) return;
        setPhase("created");
        await wait(HOLD.created);
        if (cancelled) return;
        await wait(HOLD.reset);
      }
    };

    void run();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [active]);

  return (
    <div ref={containerRef} className="w-full">
      <PhoneDemoShell>
        <div key={fadeKey} className="nl-demo-fade relative h-full overflow-hidden">
          <div
            className="relative h-full will-change-transform"
            style={{
              transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
              transform: detailIn ? "translateX(-30%)" : "translateX(0)",
            }}
          >
            <ScaledDesign>
              <PlanOverview
                highlightMeal={phase === "highlightMeal"}
                highlightConfirm={phase === "confirm" || phase === "saving"}
                confirming={phase === "saving"}
              />
            </ScaledDesign>
          </div>
          <div
            className="absolute inset-0 z-10 bg-[#F4F4F5] shadow-[-4px_0_16px_rgba(0,0,0,0.12)] will-change-transform"
            style={{
              transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
              transform: detailIn ? "translateX(0)" : "translateX(100%)",
              visibility: showDetail ? "visible" : "hidden",
            }}
          >
            {showDetail && (
              <ScaledDesign>
                <MealDetail cooking={phase === "cooking"} />
              </ScaledDesign>
            )}
          </div>
          {phase === "created" && <PlanCreatedSheet />}
        </div>
      </PhoneDemoShell>
    </div>
  );
}
