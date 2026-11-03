import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Lift, PhotoStage } from "@/components/features/PhotoStage";
import SiteClosing from "@/components/features/SiteClosing";
import Reveal from "@/components/landing/v9/Reveal";
import { StepNumber } from "@/components/landing/v9/V9LowerSections";
import { V9Screen } from "@/components/landing/v9/V9Photo";
import { Eyebrow, Glass, Head, Split, V9Section } from "@/components/landing/v9/V9Sections";
import { HideSiteFinalCta } from "@/components/pricing/SiteFinalCta";
import { PUBLIC_HEALTH_BODY_COUNT, READING_LIST, READING_LIST_COUNT } from "@/lib/research";
import { visitorOffer } from "@/lib/visitorOffer";

const title = "The homework behind every reply";
const description =
  "Before PrepIt's nutritionist says anything, it has checked your meal against official food data, the research behind each score and public health guidance. Here's what it stands on, with the published sources.";
const url = "https://www.tryprepit.app/research";

export const metadata: Metadata = {
  title: { absolute: `${title} | PrepIt` },
  description,
  alternates: { canonical: url },
  // Page-level openGraph and twitter replace the root layout's, so the site
  // name is repeated here. The preview image is the site default
  // (src/app/opengraph-image.tsx).
  openGraph: {
    type: "website",
    url,
    title,
    description,
    siteName: "PrepIt",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
};

const FIGURES: [number, string][] = [
  [READING_LIST_COUNT, "published studies and guidelines it draws on"],
  [PUBLIC_HEALTH_BODY_COUNT, "public health bodies behind supplement and water amounts"],
  [0, "cheat days, bad foods or lectures"],
];

type Pillar = {
  /** Anchor on /research. `scores` is linked from the Energy, Satiety and Mood page and guide. */
  id: string;
  label: string;
  title: string;
  body: string;
  drawsOn: ReactNode[];
};

/** "What it stands on.": five kinds of evidence, each doing one job (docs/copy/07-research.md). */
const PILLARS: Pillar[] = [
  {
    id: "numbers",
    label: "Your numbers",
    title: "Official food data, not guesses.",
    body: "Brand labels and government food databases come first, so a branded yogurt uses the brand's own figures. If you don't give an amount, it assumes a typical portion and says so on the meal.",
    drawsOn: ["USDA FoodData Central", "UK CoFID"],
  },
  {
    id: "targets",
    label: "Your targets",
    title: "Targets from a published formula.",
    body: "Your calories start from the Mifflin-St Jeor equation and how active you are. Protein is set by your body weight. Both are reviewed at your weekly check-in.",
    drawsOn: ["Mifflin-St Jeor equation, 1990"],
  },
  {
    id: "scores",
    label: "Your scores",
    title: "Energy, Satiety and Mood come from nutrition research.",
    body: "Each score draws on peer-reviewed work on how food affects your energy through the day, how long you stay full and how you feel day to day. In the app, every score shows what moved it.",
    drawsOn: [
      <i key="ajcn">American Journal of Clinical Nutrition</i>,
      <i key="bmj">The BMJ</i>,
      <i key="lancet">The Lancet</i>,
      "UK SACN",
    ],
  },
  {
    id: "coaching",
    label: "Your coaching",
    title: "Coaching from behaviour-change science.",
    body: "It uses motivational interviewing, the way many dietitians and health coaches talk about change: it reflects back what you said, asks one question at a time and lets you choose. One focus a week, reviewed at your check-in.",
    drawsOn: ["Motivational interviewing research", <i key="hp">Health Psychology</i>],
  },
  {
    id: "guidance",
    label: "Supplements and water",
    title: "Amounts from public health bodies.",
    body: "Supplement and water amounts come from public health guidance. When it suggests a supplement, it uses the public reference amount for adults, never more.",
    drawsOn: ["NHS", "EFSA", "US National Institutes of Health", "CDC"],
  },
];

const LIMITS = [
  "It won't diagnose anything.",
  "It never recommends or changes a dose beyond the public reference amount.",
  "For anything medical, or a question about your dose, it points you to your GP, a pharmacist or a registered dietitian.",
];

/** One step of "One meal, traced": the homepage's science visual at full size, with one line under each. */
function TraceStep({ n, title, box, line, delay }: { n: number; title: string; box: ReactNode; line: string; delay: number }) {
  return (
    <li className="min-w-0">
      <Reveal delay={delay} className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2.5 font-display text-[21px] leading-tight text-ink">
          <StepNumber n={n} />
          <span className="sr-only">{n}. </span>
          {title}
        </h3>
        {box}
        <p className="text-[15px] text-ink-secondary text-pretty">{line}</p>
      </Reveal>
    </li>
  );
}

/**
 * /research (PRE-278, redrawn in PRE-456 from Charlie's site pages handoff):
 * a still with real app cards, the 25 / 4 / 0 figures, one meal traced in
 * four steps, five pillars with the names each draws on, the limits as a
 * card, the reading list grouped by kind of evidence, then the homepage's
 * close. No per-score factor lists or confidence wording: "We publish what
 * it's built on. The recipe stays in the kitchen."
 */
export default async function ResearchPage() {
  const { market, prices } = await visitorOffer();
  return (
    <>
      <HideSiteFinalCta />
      <section aria-labelledby="research-heading" className="w-full bg-page text-ink">
        <div className="mx-auto w-full max-w-content px-gutter pb-section pt-[clamp(28px,4vw,56px)]">
          <Split
            text={
              <>
                <Eyebrow>Research</Eyebrow>
                <h1 id="research-heading" className="font-display text-hero text-ink text-balance">
                  The homework behind every reply.
                </h1>
                <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
                  Before your nutritionist says anything, it has checked your meal against official food data, the research
                  behind each score and public health guidance. Here&apos;s what it stands on.
                </p>
                <dl className="grid border-t border-line-strong min-[681px]:grid-cols-3">
                  {FIGURES.map(([figure, label], index) => (
                    <div
                      key={label}
                      className={`grid grid-rows-[auto_1fr] content-start gap-1.5 pb-1 pt-5 min-[681px]:pr-5 ${
                        index > 0 ? "border-t border-line min-[681px]:border-l min-[681px]:border-t-0 min-[681px]:pl-5" : ""
                      }`}
                    >
                      <dt className="row-start-2 max-w-[18em] text-[15px] text-ink-secondary">{label}</dt>
                      <dd className="row-start-1 font-display text-[clamp(44px,36px+2vw,64px)] font-medium leading-none tracking-[-0.02em] tabular-nums text-ink">
                        {figure}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            }
            media={
              <PhotoStage
                priority
                photo={{
                  name: "research-book",
                  widths: [560, 880, 1200],
                  alt: "An open reference book with a wooden spoon of rolled oats resting on the page, a pencil and a glass of water",
                  position: "78% 55%",
                }}
              >
                <Lift style={{ right: 0, top: "6%", width: "50%" }}>
                  <V9Screen
                    name="sci-meal-items"
                    width={752}
                    height={668}
                    alt="A meal broken into its ingredients, each with its own calories and macros"
                  />
                </Lift>
                <Lift style={{ left: 0, bottom: "6%", width: "56%" }}>
                  <V9Screen
                    name="see-why-energy-oats"
                    width={740}
                    height={293}
                    alt="Energy +34: morning protein provides a steady power supply to your day"
                  />
                </Lift>
              </PhotoStage>
            }
          />
        </div>
      </section>

      <V9Section id="traced" name="research-traced" labelledBy="traced-heading" band>
        <div className="flex flex-col gap-10">
          <Head
            id="traced-heading"
            label="One meal, traced"
            title="“Homemade burrito bowl, about 400 g.”"
            lead="Here's what happens to one photo and five words before the meal lands on your log."
          />
          <ol className="grid items-start gap-x-4 gap-y-10 min-[521px]:grid-cols-2 min-[981px]:grid-cols-4">
            <TraceStep
              n={1}
              title="Looks it up"
              delay={0}
              box={
                <ol
                  aria-label="Where it looks, in order"
                  className="flex min-h-[150px] flex-col justify-center gap-2 rounded-[18px] bg-surface p-3.5 text-[13px] shadow-[var(--shadow-v9-card)]"
                >
                  <li className="rounded-[10px] bg-primary px-3 py-2 font-medium text-on-primary">Brand sites and government food data</li>
                  <li className="rounded-[10px] px-3 py-2 text-ink ring-1 ring-line-strong">Nutrition sites</li>
                  <li className="rounded-[10px] border border-dashed border-line-strong px-3 py-2 text-ink-muted">Recipe sites, last</li>
                </ol>
              }
              line="Official figures come first. Crowd-typed recipes come last."
            />
            <TraceStep
              n={2}
              title="Itemises it"
              delay={90}
              box={
                <Glass>
                  <V9Screen name="sci-meal-items" width={752} height={668} alt="The meal's ingredients, each with its own numbers" />
                </Glass>
              }
              line="Every ingredient gets its own numbers, so you can fix just one."
            />
            <TraceStep
              n={3}
              title="Checks the maths"
              delay={180}
              box={
                <p className="flex min-h-[150px] flex-col justify-center gap-1 rounded-[18px] bg-surface p-3.5 text-[13px] tabular-nums text-ink-muted shadow-[var(--shadow-v9-card)]">
                  <span>4 × 59 g carbs + 4 × 50 g protein + 9 × 11 g fat</span>
                  <b className="font-display text-[38px] font-medium leading-none tracking-[-0.01em] text-ink">535 kcal</b>
                  <span>against 529 logged. It adds up.</span>
                </p>
              }
              line="If the totals don't add up, it flags the meal instead of quietly changing the numbers."
            />
            <TraceStep
              n={4}
              title="Tells you straight"
              delay={270}
              box={
                <Glass>
                  <V9Screen name="sci-satiety" width={748} height={338} alt="Satiety, with the reason in plain words" />
                </Glass>
              }
              line="It explains each number in plain words, shows what it assumed, like a typical portion, and asks when a meal is too vague."
            />
          </ol>
        </div>
      </V9Section>

      <V9Section id="stands-on" name="research-pillars" labelledBy="stands-on-heading">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 id="stands-on-heading" className="font-display text-chapter text-ink text-balance">
              What it stands on.
            </h2>
            <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
              Five kinds of evidence, each doing one job. We publish what it&apos;s built on. The recipe stays in the kitchen.
            </p>
          </div>
          <ul className="grid gap-x-14 min-[761px]:grid-cols-2">
            {PILLARS.map((pillar, index) => (
              <li
                key={pillar.id}
                id={pillar.id}
                className={`flex min-w-0 scroll-mt-28 flex-col gap-3 border-t border-line-strong pb-8 pt-6 ${
                  index === PILLARS.length - 1 ? "min-[761px]:col-span-2" : ""
                }`}
              >
                <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-accent-text">{pillar.label}</p>
                <h3 className="font-display text-title text-ink text-balance">{pillar.title}</h3>
                <p className="max-w-[40em] text-body text-ink-secondary text-pretty">{pillar.body}</p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">Draws on</p>
                  <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[14px] text-ink">
                    {pillar.drawsOn.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </V9Section>

      <section id="limits" aria-labelledby="limits-heading" className="w-full scroll-mt-28 bg-page text-ink">
        <div className="mx-auto w-full max-w-content px-gutter pb-section">
          <div className="grid gap-x-14 gap-y-7 rounded-[28px] bg-primary p-[clamp(28px,5vw,56px)] text-on-primary min-[821px]:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="text-[12px] font-bold uppercase leading-none tracking-[0.12em] text-on-primary/65">It knows its limits</p>
              <h2 id="limits-heading" className="font-display text-section text-on-primary text-balance">
                Guidance, not a diagnosis.
              </h2>
              <p className="text-body text-on-primary/80 text-pretty">
                Energy, Satiety and Mood are estimates to guide your next meal, not a medical measurement. When there isn&apos;t
                enough in your log to go on, it says so.
              </p>
            </div>
            <ul className="flex flex-col">
              {LIMITS.map((limit) => (
                <li key={limit} className="relative border-b border-on-primary/15 py-2.5 pl-[18px] text-body text-on-primary/90 text-pretty">
                  <span aria-hidden className="absolute left-0 top-[1.05em] h-1.5 w-1.5 rounded-full bg-accent" />
                  {limit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <V9Section id="sources" name="research-reading-list" labelledBy="sources-heading" band>
        <div className="flex flex-col gap-5">
          <details className="group border-y border-line-strong">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-title text-ink [&::-webkit-details-marker]:hidden">
              <span id="sources-heading">The reading list: {READING_LIST_COUNT} sources</span>
              <span
                aria-hidden
                className="grid h-9 w-9 flex-none place-items-center rounded-full border border-line-strong font-sans text-[20px] transition-transform duration-[250ms] group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="flex flex-col pb-7">
              {READING_LIST.map((group) => (
                <div key={group.id} className="flex flex-col">
                  <h3 className="mb-1 mt-[18px] text-[11.5px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                    {group.title} ({group.sources.length})
                  </h3>
                  <ul className="grid gap-x-12 min-[761px]:grid-cols-2">
                    {group.sources.map((source) => (
                      <li key={source.url} className="min-w-0 py-[5px] text-[14px] text-ink-secondary [overflow-wrap:anywhere]">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink underline decoration-line-strong underline-offset-[3px] hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                        >
                          {source.citation}
                        </a>{" "}
                        <span className="italic">{source.where}</span>.
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
          <p className="text-small text-ink-muted text-pretty">
            Named for reference. None of these organisations or journals endorses PrepIt. These are the published work PrepIt
            draws on; PrepIt itself hasn&apos;t been tested in them.
          </p>
        </div>
      </V9Section>

      <SiteClosing market={market} prices={prices} placement="research-closing" />
    </>
  );
}
