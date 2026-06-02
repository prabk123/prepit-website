import PrepItIcon from "@/components/shareable/PrepItIcon";
import NutritionLoopLogDemo from "@/components/NutritionLoopLogDemo";
import NutritionLoopSignalsDemo from "@/components/NutritionLoopSignalsDemo";

const STEPS = [
  {
    number: 1,
    title: "Log",
    body: "Say what you ate, in your own words or with a photo. PrepIt builds the meal in seconds, and you just confirm.",
  },
  {
    number: 2,
    title: "Understand",
    body: "Energy, Satiety, and Mood turn each meal into three live scores, so you know how you'll feel, not just what you logged.",
  },
  {
    number: 3,
    title: "Adjust",
    body: "Every log comes with one clear next step, and an AI nutritionist when you want to go deeper.",
  },
] as const;

const SNIPPETS = [NutritionLoopLogDemo, NutritionLoopSignalsDemo, CoachSnippet] as const;

/** Shared demo height so step titles and copy align across columns. */
const LOOP_DEMO_SLOT_CLASS = "relative w-full pb-5 md:h-[158px]";

function CoachSnippet() {
  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        className="flex min-h-0 flex-1 flex-col rounded-2xl p-[2px] shadow-sm"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--gradient-blue) 0%, var(--gradient-purple) 31%, var(--gradient-orange) 63%, var(--gradient-yellow) 97.5%)",
        }}
      >
        <div
          className="flex min-h-0 flex-1 flex-col rounded-[14px] px-3 pb-7 pt-3"
          style={{
            backgroundImage:
              "linear-gradient(90deg, color-mix(in srgb, var(--gradient-blue) 10%, #ffffff) 0%, color-mix(in srgb, var(--gradient-purple) 10%, #ffffff) 31%, color-mix(in srgb, var(--gradient-orange) 10%, #ffffff) 63%, color-mix(in srgb, var(--gradient-yellow) 10%, #ffffff) 97.5%)",
          }}
        >
          <div className="flex items-center gap-2">
            <PrepItIcon name="sparkles" size={18} color="var(--black-100)" />
            <p className="text-sm font-bold leading-[21px] text-[var(--black-100)]">
              Afternoon Energy looks soft
            </p>
          </div>
          <p className="mt-2 text-xs font-medium leading-5 text-[var(--grey-80)]">
            Your wrap and flat white are light on protein. A Greek yogurt now would help hold
            Satiety until dinner.
          </p>
        </div>
      </div>

      <div className="absolute right-3 -bottom-3.5" aria-hidden>
        <div className="flex items-center gap-2 rounded-full bg-[var(--black-100)] px-4 py-2.5 text-xs font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          Explore this deeper
          <PrepItIcon name="arrowRight" size={12} color="#ffffff" />
        </div>
      </div>
    </div>
  );
}

function StepNode({
  number,
  title,
  body,
  Snippet,
}: {
  number: number;
  title: string;
  body: string;
  Snippet: (typeof SNIPPETS)[number];
}) {
  return (
    <article className="flex h-full flex-col gap-4 text-left">
      <div className="flex flex-col items-center gap-5 md:gap-6">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--black-100)] bg-[var(--black-100)] text-xs font-semibold text-white shadow-md"
          aria-hidden
        >
          {number}
        </div>
        <div className={LOOP_DEMO_SLOT_CLASS}>
          <Snippet />
        </div>
      </div>

      <div className="flex flex-col gap-2 px-1">
        <h3 className="text-base font-semibold leading-snug text-[var(--black-100)] lg:text-lg">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
          {body}
        </p>
      </div>
    </article>
  );
}

function StaticConnector() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[13px] hidden items-center md:flex"
      style={{ paddingInline: "calc(100% / 6)" }}
      aria-hidden
    >
      <div className="h-px flex-1 bg-[var(--black-100)]" />
      <PrepItIcon name="chevronRight" size={16} color="var(--black-100)" />
      <div className="h-px flex-1 bg-[var(--black-100)]" />
      <PrepItIcon name="chevronRight" size={16} color="var(--black-100)" />
      <div className="h-px flex-1 bg-[var(--black-100)]" />
    </div>
  );
}

export default function NutritionLoopSection() {
  return (
    <section
      id="nutrition-loop"
      aria-labelledby="nutrition-loop-heading"
      aria-describedby="nutrition-loop-subtitle"
      className="flex w-full flex-col items-center bg-white px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10 text-center lg:gap-14">
        <div className="flex max-w-[820px] flex-col gap-4">
          <h2
            id="nutrition-loop-heading"
            className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
            style={{ fontFamily: "var(--font-brand)" }}
          >
            Not just tracking. A loop that actually changes how you eat.
          </h2>
          <p
            id="nutrition-loop-subtitle"
            className="text-base font-medium leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
          >
            Every log makes your coach smarter. The loop is the product.
          </p>
        </div>

        <div className="relative w-full md:pt-2">
          <StaticConnector />

          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:items-stretch md:gap-6 lg:gap-8">
            {STEPS.map((step, index) => (
              <StepNode
                key={step.title}
                number={step.number}
                title={step.title}
                body={step.body}
                Snippet={SNIPPETS[index]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
