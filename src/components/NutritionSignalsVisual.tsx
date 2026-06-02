import FactorInsightCard, {
  type FactorInsight,
} from "@/components/signals/FactorInsightCard";
import SignalRing from "@/components/signals/SignalRing";
import PrepItIcon from "@/components/shareable/PrepItIcon";

const HOME_SIGNALS = [
  { label: "Drive", score: 68 },
  { label: "Control", score: 52 },
  { label: "Balance", score: 71 },
] as const;

const FACTOR_STACK: (FactorInsight & { stackClass: string })[] = [
  {
    label: "Glycaemic quality",
    summary: "Moderate GL from wrap + flat white",
    component: 0.42,
    baselineComponent: 0.55,
    weight: 0.18,
    stackClass:
      "relative z-10 mx-3 rotate-[-2.5deg] opacity-55 shadow-[0_1px_6px_rgba(0,0,0,0.06)]",
  },
  {
    label: "Fibre",
    summary: "12g / 30g toward benchmark",
    component: 0.45,
    weight: 0.25,
    stackClass:
      "relative z-20 -mt-3 mx-1.5 rotate-[1deg] opacity-80 shadow-[0_2px_10px_rgba(0,0,0,0.07)]",
  },
  {
    label: "Protein",
    summary: "28g / 120g expected",
    component: 0.38,
    baselineComponent: 0.52,
    weight: 0.28,
    impact:
      "Protein grams and protein share of calories are the largest lift to Control.",
    expanded: true,
    contributorsSectionLabel: "From your log",
    contributorColumnHeaders: ["Protein (g)"],
    contributors: [
      { title: "Chicken wrap", values: ["14.2"] },
      { title: "Flat white", values: ["8.1"] },
      { title: "Apple", values: ["0.3"] },
    ],
    stackClass: "relative z-30 -mt-3 shadow-[0_4px_16px_rgba(0,0,0,0.1)]",
  },
];

function HomeSignalLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[14px] font-medium text-[var(--grey-80)]">
      {label}
      <PrepItIcon name="chevronRight" size={14} color="var(--grey-40)" />
    </span>
  );
}

export default function NutritionSignalsVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-[360px] rounded-2xl bg-[#F4F4F5] px-5 pb-6 pt-5"
      aria-hidden="true"
    >
      <div className="relative z-40 rounded-xl bg-white px-3 pb-3.5 pt-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-start justify-evenly gap-1">
          {HOME_SIGNALS.map((signal) => (
            <div key={signal.label} className="flex min-w-0 flex-1 flex-col items-center">
              <SignalRing
                score={signal.score}
                label=""
                filled
                size={88}
                showScoreOnly
              />
              <div className="mt-2">
                <HomeSignalLabel label={signal.label} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative -mt-5 pt-2">
        {FACTOR_STACK.map((factor) => (
          <FactorInsightCard
            key={factor.label}
            factor={factor}
            className={factor.stackClass}
          />
        ))}
      </div>
    </div>
  );
}
