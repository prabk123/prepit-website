"use client";

import PrepItIcon from "@/components/shareable/PrepItIcon";

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

function MacroChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center rounded-[10px] bg-[var(--grey-5)] px-1 py-1.5 max-[699px]:rounded-[10px] min-[700px]:rounded-xl min-[700px]:px-1.5 min-[700px]:py-2">
      <p className="text-sm font-bold leading-none text-[var(--black-100)] min-[700px]:text-base">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-medium text-[var(--grey-60)] min-[700px]:mt-1 min-[700px]:text-[11px]">
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
  const width = 80;
  const height = 40;
  const stroke = 6;
  const r = (width - stroke) / 2;
  const cy = height;
  const arcLength = Math.PI * r;
  const filled = arcLength * Math.min(1, Math.max(0, progress));
  const path = `M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${width - stroke / 2} ${cy}`;

  return (
    <div
      className="relative shrink-0 min-[700px]:h-11 min-[700px]:w-[88px]"
      style={{ width, height }}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full overflow-visible"
      >
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
          stroke="var(--success)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLength}`}
        />
      </svg>
      <p
        className="absolute inset-x-0 top-[16px] text-center text-lg font-semibold leading-6 text-[var(--black-100)] min-[700px]:top-[18px] min-[700px]:text-xl"
        style={{ fontFamily: "var(--font-brand)" }}
      >
        {percentLabel}
      </p>
    </div>
  );
}

export default function MealReviewCard() {
  const confidencePct = Math.round(MEAL.confidence * 100);

  return (
    <div className="w-full rounded-2xl border border-[var(--grey-10)] bg-[var(--surface)] p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.16)] min-[700px]:p-4">
      <p
        className="line-clamp-2 text-[15px] font-semibold leading-6 text-[var(--black-100)] min-[700px]:text-base"
        style={{ fontFamily: "var(--font-brand)" }}
      >
        {MEAL.title}
      </p>
      <div className="mt-2.5 flex gap-1.5 min-[700px]:mt-3 min-[700px]:gap-2">
        <MacroChip value={MEAL.calories.toLocaleString()} label="Calories" />
        <MacroChip value={`${MEAL.carbs}g`} label="Carbs" />
        <MacroChip value={`${MEAL.protein}g`} label="Protein" />
        <MacroChip value={`${MEAL.fats}g`} label="Fat" />
      </div>
      <div className="mt-3 flex flex-col gap-2 min-[700px]:mt-3.5 min-[700px]:gap-2.5">
        {MEAL.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[13px] font-medium text-[var(--black-100)] min-[700px]:text-sm">
              {item.name}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[var(--coral-100)] min-[700px]:text-xs">
              <PrepItIcon name="fire" size={12} color="var(--coral-100)" />
              {item.calories} cal
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-[var(--grey-10)] pt-3 min-[700px]:mt-3.5 min-[700px]:pt-3.5">
        <div className="flex items-center gap-3 min-[700px]:gap-4">
          <SemiCircleConfidenceGauge
            progress={MEAL.confidence}
            percentLabel={`${confidencePct}`}
          />
          <div>
            <p className="text-[15px] font-bold leading-6 text-[var(--black-100)] min-[700px]:text-base">
              High
            </p>
            <p className="text-[11px] font-medium leading-4 text-[var(--grey-60)] min-[700px]:text-xs">
              Confidence Level
            </p>
          </div>
        </div>
        <p className="mt-2.5 line-clamp-2 text-[11px] leading-[18px] text-[var(--black-100)] min-[700px]:mt-3 min-[700px]:line-clamp-4 min-[700px]:text-xs">
          {MEAL.estimationNotes}
        </p>
      </div>
    </div>
  );
}
