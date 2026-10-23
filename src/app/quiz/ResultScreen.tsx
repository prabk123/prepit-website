import { Caption, Card, CardTitle, ESTIMATES, Eyebrow, MiniPhone, Question, REAL_SCREENS, Shot, TargetTiles, Timeline } from "@/components/quiz/parts";
import { PRICES } from "@/lib/pricing";
import { proteinFirst, type QuizAnswers, resultHeadline, resultTags, startingPoint, type Targets, trialDay } from "@/lib/quiz/quiz";

const STRIP = [
  {
    src: "/quiz/signals.webp",
    width: 640,
    height: 711,
    alt: "How one breakfast moved the day's Energy (+34), Satiety (+4) and Mood (+11), each with a reason",
    caption: "Every meal, with the reasons",
  },
  {
    src: "/quiz/plan-head.webp",
    width: 640,
    height: 588,
    alt: "A week planned: 21 meals, a grocery list of 30 ingredients and the daily target",
    caption: "Your week, planned",
  },
  {
    src: "/quiz/protein.webp",
    width: 640,
    height: 474,
    alt: "PrepIt message: protein has been a little low over the past few weeks, mostly at dinner, with two fixes that don't change what you cook",
    caption: "Your nutritionist notices",
    tag: true,
  },
];

const PHONES: [string, string][] = [
  ["01-home", "Home with the three scores"],
  ["10-voice-note", "A voice note logged in chat"],
  ["02-chat-chart", "Protein per day in chat"],
  ["27b-plan-swap", "Swapping a planned dinner in chat"],
];

const INCLUDED = [
  "Describe meals by typing, talking or taking a photo",
  "Energy, Satiety and Mood scores every day",
  "Ask Nutritionist any time, about your own meals and goals",
  "Your nutrition consultation in week one, then a check-in every week",
  "Meal plans with grocery lists and a cost estimate",
  "Widgets and Apple Health",
];

/** $99.99 a year as a monthly figure, e.g. "$8.33". */
const PER_MONTH = `$${(Number.parseFloat(PRICES.annual.replace(/[^\d.]/g, "")) / 12).toFixed(2)}`;

/**
 * The quiz's plan page: the starting point, daily targets from the backend,
 * the free week with its dates, what's included and the price. The plan
 * itself is chosen on the bridge.
 */
export default function ResultScreen({ answers, targets }: { answers: QuizAnswers; targets: Targets | null | undefined }) {
  const point = startingPoint(answers);
  return (
    <>
      <Eyebrow>Your plan</Eyebrow>
      <Question>
        <span className="text-[32px]">{resultHeadline(answers)}</span>
      </Question>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Your plan covers">
        {resultTags(answers).map((tag) => (
          <li key={tag} className="rounded-control border border-line-strong bg-surface px-2.5 py-1 text-[13px] text-ink-secondary">
            {tag}
          </li>
        ))}
      </ul>

      <div className="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2.5 pt-1 [scrollbar-width:none]" aria-label="Real PrepIt app screens" role="region" tabIndex={0}>
        {STRIP.map((shot) => (
          <Shot key={shot.src} {...shot} className="w-[76%] max-w-[260px] flex-none snap-start" />
        ))}
      </div>
      <Caption className="-mt-3">
        {REAL_SCREENS} Swipe for more. {ESTIMATES}
      </Caption>

      <Card>
        <p className="mb-1 text-eyebrow font-medium uppercase tracking-[0.12em] text-ink-muted">Your starting point</p>
        <p className="mb-2 mt-0.5 font-display text-[24px] font-medium leading-[1.15] text-ink">{point.name}</p>
        <p className="text-[15px] text-ink-secondary">
          {point.why} {point.line}
        </p>
        <p className="mt-3 border-t border-line pt-2.5 text-small leading-[1.45] text-ink-secondary">
          Session 1 today is a five-minute chat with your AI nutritionist about why you&apos;re here and what a normal day looks like. After
          about 3 days of meals, Session 2 shows the patterns in what you actually ate, so you&apos;ll see if this is the right place to start.
        </p>
      </Card>

      <Card>
        <CardTitle>Your daily targets</CardTitle>
        <p className="text-[15px] text-ink-secondary">Set from your answers. You can change them any time.</p>
        {targets ? (
          <TargetTiles targets={targets} proteinFirst={proteinFirst(answers)} />
        ) : (
          <p className="mt-2.5 rounded-[14px] bg-page px-3 py-2.5 text-small text-ink-secondary" role="status">
            {targets === undefined ? "Working out your targets…" : "Your nutritionist sets these with you in the app."}
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>Your first 7 days are free</CardTitle>
        <div className="mt-3">
          <Timeline
            items={[
              { when: "Today", what: "Full access and your first session", how: "Getting to know you, about 5 minutes. You pay $0.", state: "now" },
              { when: "After about 3 days", what: "What I've noticed so far", how: "Your patterns, and one focus to work on." },
              { when: `Day 4, ${trialDay(4)}`, what: "Reminder email", how: "We email you a reminder, 4 days before any charge." },
              { when: `Around day 7, ${trialDay(7)}`, what: "Week-in-review", how: "Your first weekly check-in." },
              { when: `Day 8, ${trialDay(8)}`, what: "Your plan starts, if you keep it", how: "Cancel before then and you pay nothing.", state: "pay" },
            ]}
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Everything&apos;s included</CardTitle>
        <ul className="mt-2.5 flex list-none flex-col gap-[9px] p-0">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-2.5 text-[15px] text-ink">
              <span aria-hidden className="mt-0.5 grid size-[18px] flex-none place-items-center rounded-full bg-primary text-on-primary">
                <svg width="12" height="12" viewBox="0 0 16 16">
                  <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <div className="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2.5 pt-1 [scrollbar-width:none]" aria-label="More PrepIt app screens" role="region" tabIndex={0}>
        {PHONES.map(([name, alt]) => (
          <MiniPhone key={name} name={name} alt={alt} className="w-[132px] flex-none snap-start" />
        ))}
      </div>
      <Caption className="-mt-2">{REAL_SCREENS} Swipe for more.</Caption>

      <Card>
        <CardTitle>What it costs</CardTitle>
        <p className="mb-2.5 mt-1.5 font-display text-[40px] font-medium leading-none tabular-nums text-ink">$0 today</p>
        <p className="text-[15px] text-ink-secondary">
          Then <b className="text-ink">{PRICES.annual}</b> a year (that works out at {PER_MONTH} a month), or{" "}
          <b className="text-ink">{PRICES.monthly}</b> a month. You choose your plan on the next step.
        </p>
        <p className="mt-2.5 text-[12.5px] leading-[1.45] text-ink-muted">
          Yearly saves 44% vs monthly. Renews automatically until you cancel. Prices in US dollars. PrepIt is an iPhone app; Android is coming
          soon. PrepIt is a coach, not a doctor.
        </p>
      </Card>

      <div className="border-t border-line">
        {[
          {
            q: "Do I have to count calories?",
            a: "No. You describe what you ate in plain words and PrepIt works out the numbers for you. Your nutritionist talks about energy, hunger and the one thing to change.",
          },
          {
            q: "What happens on day 8?",
            a: `If you keep PrepIt, your plan starts: ${PRICES.annual} for the year (that works out at ${PER_MONTH} a month), or ${PRICES.monthly} a month if you pick monthly. We email you a reminder on day 4, and you can cancel any time before day 8 and pay nothing.`,
          },
          {
            q: "Is the nutritionist a person?",
            a: "No. PrepIt's nutritionist is an AI nutritionist. Your nutritionist works from your meals and goals, gives nutrition guidance rather than medical advice, and points you to a professional when you need one.",
          },
        ].map(({ q, a }) => (
          <details key={q} className="border-b border-line py-3">
            <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">{q}</summary>
            <p className="mt-2 text-small text-ink-secondary">{a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
