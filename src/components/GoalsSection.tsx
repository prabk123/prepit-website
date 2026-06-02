import PrepItIcon, { type PrepItIconName } from "@/components/shareable/PrepItIcon";

const GOALS: {
  label: string;
  benefit: string;
  icon: PrepItIconName;
}[] = [
  {
    label: "Lose fat",
    benefit:
      "Clear calorie targets, stronger satiety cues, and a practical way back when a day goes off-plan.",
    icon: "scale",
  },
  {
    label: "Build muscle",
    benefit:
      "Protein-first logging, growth-friendly macros, and meal timing that fits your training.",
    icon: "protein",
  },
  {
    label: "More energy",
    benefit:
      "Meals and timing tuned for steady focus, without the mid-afternoon crash.",
    icon: "sparkles",
  },
  {
    label: "Stay fuller",
    benefit:
      "See which foods actually satisfy you, and calm grazing between meals.",
    icon: "leaf",
  },
  {
    label: "Eat healthier",
    benefit:
      "Smarter swaps, better daily quality, and patterns that leave you feeling steadier.",
    icon: "homeLeaf",
  },
  {
    label: "Fuel training",
    benefit:
      "Training-day nutrition that supports hard sessions and faster recovery.",
    icon: "chefHat",
  },
];

function GoalCard({
  label,
  icon,
  benefit,
}: {
  label: string;
  icon: PrepItIconName;
  benefit: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--grey-10)] bg-white p-4 text-left shadow-sm lg:p-5">
      <div className="ai-icon-chrome shrink-0" aria-hidden>
        <div className="ai-icon-chrome__inner">
          <PrepItIcon name={icon} size={20} color="var(--black-100)" />
        </div>
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug text-[var(--black-100)]">
        {label}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
        {benefit}
      </p>
    </article>
  );
}

export default function GoalsSection() {
  return (
    <section
      id="goals"
      aria-labelledby="goals-heading"
      className="flex w-full flex-col items-center bg-[var(--grey-5)] px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10 text-center lg:gap-12">
        <div className="flex max-w-[720px] flex-col gap-4">
          <h2
            id="goals-heading"
            className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            Whatever you&apos;re working on, PrepIt optimises for it.
          </h2>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 text-left sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {GOALS.map((goal) => (
            <GoalCard key={goal.label} {...goal} />
          ))}
        </div>
      </div>
    </section>
  );
}
