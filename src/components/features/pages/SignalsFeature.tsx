import { V9Screen } from "@/components/landing/v9/V9Photo";
import { Chip, DotTag, Glass, Split, V9Section } from "@/components/landing/v9/V9Sections";
import TextLink from "@/components/ui/TextLink";

/**
 * Each score as the question it answers, with the app's own plain-words
 * reason card under it (PRE-452). The "What moves each score" factor lists
 * are gone on purpose: no inputs, weights or thresholds are spelled out on
 * the site.
 */
const QUESTIONS = [
  {
    tag: "Energy",
    question: "Will you hit a slump mid-afternoon?",
    screen: { name: "see-why-energy-oats", width: 740, height: 293 },
    alt: "Energy +34: morning protein provides a steady power supply to your day",
  },
  {
    tag: "Satiety",
    question: "Will you stay full until your next meal?",
    screen: { name: "see-why-satiety", width: 732, height: 295 },
    alt: "Satiety, with the reason in plain words",
  },
  {
    tag: "Mood",
    question: "Will today feel calm and steady?",
    screen: { name: "see-why-mood", width: 732, height: 337 },
    alt: "Mood, with the reason in plain words",
  },
];

/** "Nothing to wear or charge.": the same row as "What it won't do." on the Features overview. */
const NOTHING_TO_WEAR = [
  ["No ring.", "Everything starts from what you eat."],
  ["No watch.", "Connect Apple Health and it can tell a hungry gym day from a hungry rest day."],
  ["No glucose monitor.", "No sensors, no finger pricks, no extra kit."],
  ["No guessing.", "When there isn't enough in your log to go on, it says so."],
];

/**
 * /features/nutrition-signals (PRE-452, from Charlie's site pages handoff,
 * docs/copy/03-signals.md): three questions with their reason cards, every
 * number comes with a reason, and nothing to wear or charge. The hero, the
 * related-feature tiles and the close are the shared parts from PRE-450.
 */
export default function SignalsFeature() {
  return (
    <>
      <V9Section id="three-questions" name="three-questions" labelledBy="three-questions-heading" band>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 id="three-questions-heading" className="font-display text-chapter text-ink text-balance">
              Three questions, answered as you eat.
            </h2>
            <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
              Each score runs from 0 to 100 and turns green, amber or red, while there&apos;s still time to change dinner.
            </p>
          </div>
          <ul className="grid gap-6 min-[900px]:grid-cols-3">
            {QUESTIONS.map((item) => (
              <li key={item.tag} className="relative pt-3">
                <span className="absolute left-3.5 top-0 z-[2]">
                  <DotTag pill>{item.tag}</DotTag>
                </span>
                <div className="flex h-full flex-col gap-3 rounded-[18px] bg-white p-4 pt-6 shadow-[var(--shadow-v9-card)] ring-1 ring-black/5">
                  <h3 className="font-display text-[22px] font-medium leading-tight text-ink text-balance">{item.question}</h3>
                  <div className="mt-auto overflow-hidden rounded-xl">
                    <V9Screen {...item.screen} alt={item.alt} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </V9Section>

      <V9Section id="every-reason" name="every-reason" labelledBy="every-reason-heading">
        <Split
          reverse
          text={
            <>
              <h2 id="every-reason-heading" className="font-display text-chapter text-ink text-balance">
                Every number comes with a reason.
              </h2>
              <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
                Tap a ring and it tells you what moved it, in plain words. Open any meal to see what it did to each
                score, with a tip for next time.
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip>Tap a ring for the why</Chip>
                <Chip>Each meal shows its effect</Chip>
              </div>
            </>
          }
          media={
            // The capture ends at the top of the Energy card, above its "How it's shaped" rows.
            <Glass className="mx-auto w-full max-w-[360px]">
              <picture>
                <source type="image/avif" srcSet="/app/05-meal-detail-light@1x.avif 402w, /app/05-meal-detail-light@2x.avif 804w" sizes="360px" />
                <img
                  src="/app/05-meal-detail-light@2x.webp"
                  srcSet="/app/05-meal-detail-light@1x.webp 402w, /app/05-meal-detail-light@2x.webp 804w"
                  sizes="360px"
                  alt="Protein overnight oats: calories, macros, each ingredient, and its Energy card"
                  width={804}
                  height={1748}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </picture>
            </Glass>
          }
        />
      </V9Section>

      <V9Section id="nothing-to-wear" name="nothing-to-wear" labelledBy="nothing-to-wear-heading" band>
        <div className="flex flex-col gap-8">
          <h2 id="nothing-to-wear-heading" className="font-display text-section text-ink text-balance">
            Nothing to wear or charge.
          </h2>
          <ul className="grid border-t border-line-strong min-[521px]:grid-cols-2 min-[901px]:grid-cols-4">
            {NOTHING_TO_WEAR.map(([heading, body]) => (
              <li
                key={heading}
                className="border-b border-line py-5 pr-3.5 min-[901px]:border-b-0 min-[901px]:border-r min-[901px]:px-[22px] min-[901px]:pb-1.5 min-[901px]:first:pl-0 min-[901px]:last:border-r-0"
              >
                <h3 className="mb-2.5 font-display text-[22px] font-medium leading-tight text-ink">{heading}</h3>
                <p className="text-[15.5px] text-ink-secondary">{body}</p>
              </li>
            ))}
          </ul>
          <p className="max-w-[60ch] text-small text-ink-muted text-pretty">
            The scores are built on published nutrition research. They&apos;re estimates to guide your next meal, not a
            medical measurement. <TextLink href="/research#scores">What they&apos;re built on</TextLink>
          </p>
        </div>
      </V9Section>
    </>
  );
}
