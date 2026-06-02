import NutritionSignalsVisual from "@/components/NutritionSignalsVisual";

const SIGNAL_CARDS = [
  {
    title: "Energy",
    body: "Will you have the energy and focus to get through the day? Built from your meal timing, glycaemic load and how early you front-load calories.",
  },
  {
    title: "Satiety",
    body: "Will you stay in control around food this afternoon? Driven by protein, fibre, and how processed your meals are.",
  },
  {
    title: "Mood",
    body: "Will you feel steady or on edge? Shaped by food quality, vegetables, alcohol and how deep your deficit runs.",
  },
] as const;

function SignalCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="flex flex-col gap-2 border-b border-[var(--grey-10)] pb-6 text-left last:border-b-0 last:pb-0">
      <h3 className="text-base font-semibold leading-snug text-[var(--black-100)] lg:text-lg">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-[var(--grey-60)] lg:text-base lg:leading-[27px]">
        {body}
      </p>
    </article>
  );
}

export default function NutritionSignalsSection() {
  return (
    <section
      id="nutrition-signals"
      aria-labelledby="nutrition-signals-heading"
      aria-describedby="nutrition-signals-body"
      className="flex w-full flex-col items-center bg-white px-4 py-16 lg:px-20 lg:py-24"
    >
      <div className="flex w-full max-w-[1200px] flex-col-reverse items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-8 text-left">
          <div className="flex flex-col gap-4">
            <h2
              id="nutrition-signals-heading"
              className="text-[32px] font-semibold leading-tight tracking-tight text-[var(--black-100)] lg:text-[40px]"
              style={{ fontFamily: "var(--font-brand)" }}
            >
              Calories tell you what you ate. Your nutrition signals tell you how you&apos;ll
              feel.
            </h2>
            <p
              id="nutrition-signals-body"
              className="text-base font-normal leading-relaxed text-[var(--grey-60)] lg:text-lg lg:leading-[27px]"
            >
              Your daily nutrition signals are a 0–100 score built from three things you actually
              care about. It&apos;s forward-looking: not a report card on yesterday, but a read
              on what today&apos;s food is setting you up for. And it needs nothing but your food
              log. No wearable, no CGM.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {SIGNAL_CARDS.map((card) => (
              <SignalCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-base font-semibold leading-relaxed text-[var(--black-100)] lg:text-lg">
              No app connects what you ate to how you&apos;ll feel, in real time, with a
              specific food fix.
            </p>
            <p className="text-sm leading-relaxed text-[var(--grey-60)] lg:text-base">
              Every signal is grounded in published nutrition research, not vibes.
            </p>
          </div>
        </div>

        <div className="flex w-full shrink-0 justify-center lg:sticky lg:top-24 lg:w-[380px]">
          <NutritionSignalsVisual />
        </div>
      </div>
    </section>
  );
}
