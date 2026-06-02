import type { ReactNode } from "react";
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
  inputFill: "#F4F4F5",
  calorieAccent: "#FF644F",
  onTrackText: "#258400",
  onTrackBg: "#EBFFE3",
  calChipBg: "rgba(255, 100, 79, 0.1)",
  calChipText: "#B24637",
} as const;

const DESIGN_WIDTH = 390;
const SCALE = 288 / DESIGN_WIDTH;

function DonutRing({ progress, isOver = false }: { progress: number; isOver?: boolean }) {
  const size = 24;
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = isOver ? 1 : Math.min(1, Math.max(progress, 0.05));
  const dash = c * p;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.inputFill} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={isOver ? "#D93C27" : C.calorieAccent}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - dash}
      />
    </svg>
  );
}

function MacroGroupDivider() {
  return (
    <div className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
      <div className="h-4 w-0.5 bg-[#E9E9EA]" />
    </div>
  );
}

function MacroCell({ name, eaten, goal }: { name: string; eaten: number; goal: number }) {
  const over = goal > 0 && eaten > goal;
  const progress = goal > 0 ? eaten / goal : 0;

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center">
      <div className="flex min-w-0 items-center gap-2">
        <DonutRing progress={progress} isOver={over} />
        <div className="min-w-0">
          <p
            className="text-sm font-bold leading-[21px] text-black"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {name}
          </p>
          <p
            className="text-xs font-medium leading-[18px]"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: over ? "#D93C27" : C.textSecondary,
            }}
          >
            {goal > 0 ? `${eaten}/${goal}g` : "0/0g"}
          </p>
        </div>
      </div>
    </div>
  );
}

function CalorieChip({ kcal }: { kcal: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-[3px]"
      style={{ backgroundColor: C.calChipBg }}
    >
      <PrepItIcon name="fire" size={12} color={C.calorieAccent} />
      <span
        className="text-[10px] font-extrabold leading-3"
        style={{ fontFamily: "var(--font-dm-sans)", color: C.calChipText }}
      >
        {kcal.toLocaleString()} kcal
      </span>
    </span>
  );
}

function MacroLetterChip({ letter, grams }: { letter: string; grams: number }) {
  return (
    <span
      className="inline-flex rounded-full px-1.5 py-[3px] text-[10px] leading-3 text-black"
      style={{ fontFamily: "var(--font-dm-sans)", backgroundColor: C.inputFill }}
    >
      <span className="font-extrabold">{letter}</span>
      <span className="font-medium"> {grams}g</span>
    </span>
  );
}

function FoodCardLog({
  title,
  kcal,
  carbs,
  protein,
  fat,
}: {
  title: string;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
}) {
  return (
    <div
      className="rounded-2xl border bg-white p-3"
      style={{ borderColor: C.border }}
    >
      <p
        className="text-sm font-medium leading-[21px] text-black"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {title}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <CalorieChip kcal={kcal} />
        <MacroLetterChip letter="C" grams={carbs} />
        <MacroLetterChip letter="P" grams={protein} />
        <MacroLetterChip letter="F" grams={fat} />
      </div>
    </div>
  );
}

function MealTypeActionButton() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
      aria-hidden
    >
      <PrepItIcon name="plus" size={14} color="#ffffff" />
    </div>
  );
}

function MealSection({
  title,
  totals,
  children,
}: {
  title: string;
  totals: string;
  children?: ReactNode;
}) {
  return (
    <div className="px-4 pb-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p
            className="text-xl font-semibold leading-[30px] text-black"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            {title}
          </p>
          <p
            className="mt-0.5 text-xs font-medium leading-[18px]"
            style={{ fontFamily: "var(--font-dm-sans)", color: C.textBody }}
          >
            {totals}
          </p>
        </div>
        <MealTypeActionButton />
      </div>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function LogHeader() {
  return (
    <div className="flex h-14 items-center justify-between px-2">
      <button
        type="button"
        className="flex items-center gap-1 rounded-xl px-2 py-1"
        aria-hidden
        tabIndex={-1}
      >
        <span
          className="text-xl font-bold leading-[30px] text-black"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          Today, 2 Jun
        </span>
        <PrepItIcon name="chevronDown" size={25} color={C.textPrimary} />
      </button>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1 rounded-2xl bg-white px-2 py-2"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          <PrepItIcon name="fire" size={24} color={C.calorieAccent} />
          <span className="text-sm font-bold leading-[21px] text-black">4</span>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
          <PrepItIcon name="calendarDay" size={25} color={C.textPrimary} />
        </div>
      </div>
    </div>
  );
}

function NutritionCard() {
  const consumed = 628;
  const goal = 2000;
  const left = goal - consumed;
  const fillRatio = consumed / goal;
  const fillWidth = `${Math.max(8, Math.round(fillRatio * 100))}%`;

  return (
    <div className="mx-4 rounded-[20px] border bg-white p-4" style={{ borderColor: C.border }}>
      <div className="flex items-center gap-4">
        <PrepItIcon name="fire" size={40} color={C.calorieAccent} />
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-medium leading-[18px]"
              style={{ fontFamily: "var(--font-dm-sans)", color: C.textSecondary }}
            >
              Eaten
            </p>
            <p className="mt-0.5 leading-none text-black">
              <span
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-brand)" }}
              >
                {consumed.toLocaleString()}{" "}
              </span>
              <span
                className="text-base font-medium"
                style={{ fontFamily: "var(--font-dm-sans)", color: C.textTertiary }}
              >
                kcal
              </span>
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-1 text-xs font-medium"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: C.onTrackText,
              backgroundColor: C.onTrackBg,
            }}
          >
            On track
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Burned", value: 0 },
          { label: "Left", value: left },
          { label: "Goal", value: goal },
        ].map((stat) => (
          <div key={stat.label}>
            <p
              className="text-xs font-medium leading-[18px]"
              style={{ fontFamily: "var(--font-dm-sans)", color: C.textSecondary }}
            >
              {stat.label}
            </p>
            <p className="mt-0.5 leading-none text-black">
              <span
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-brand)" }}
              >
                {stat.value.toLocaleString()}{" "}
              </span>
              <span
                className="text-xs font-medium"
                style={{ fontFamily: "var(--font-dm-sans)", color: C.textTertiary }}
              >
                kcal
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-4 h-4 overflow-hidden rounded bg-[#F4F4F5]">
        <div
          className="absolute inset-y-0 left-0 rounded"
          style={{
            width: fillWidth,
            background: "linear-gradient(90deg, #FF644F 0%, #FFBFB7 100%)",
          }}
        />
      </div>

      <div className="mt-4 flex items-center">
        <MacroCell name="Carbs" eaten={72} goal={250} />
        <MacroGroupDivider />
        <MacroCell name="Protein" eaten={38} goal={150} />
        <MacroGroupDivider />
        <MacroCell name="Fat" eaten={22} goal={65} />
      </div>
    </div>
  );
}

function LogScreenContent() {
  return (
    <div className="bg-[#F4F4F5] pb-6 pt-[47px]" style={{ width: DESIGN_WIDTH }}>
      <LogHeader />
      <div className="px-0">
        <NutritionCard />
      </div>
      <div className="mt-6">
        <MealSection title="Breakfast" totals="312 kcal, 28g Carbs, 24g Protein, 8g Fat">
          <FoodCardLog
            title="Greek yogurt with berries"
            kcal={312}
            carbs={28}
            protein={24}
            fat={8}
          />
        </MealSection>
        <MealSection title="Lunch" totals="0 kcal, 0g Carbs, 0g Protein, 0g Fat" />
        <MealSection title="Dinner" totals="0 kcal, 0g Carbs, 0g Protein, 0g Fat" />
        <MealSection title="Snacks" totals="0 kcal, 0g Carbs, 0g Protein, 0g Fat" />
      </div>
    </div>
  );
}

export default function FakeLogScreenDemo() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#F4F4F5]">
      <div
        className="pointer-events-none origin-top-left select-none"
        style={{
          transform: `scale(${SCALE})`,
          width: DESIGN_WIDTH,
        }}
        aria-hidden
      >
        <LogScreenContent />
      </div>
    </div>
  );
}
