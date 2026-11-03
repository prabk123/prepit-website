import { CapturePicture } from "@/components/features/PhotoStage";
import { Chip, DotTag, Eyebrow, Glass, Head, NutritionistSaid, Split, V9Section, YouSaid } from "@/components/landing/v9/V9Sections";
import { missedBreakfast, proteinShort, weeklyPattern } from "@/content/nutritionistMessages";
import { appCapture } from "@/lib/captures";

/** The free consultation: the same three steps as the cart and the homepage offer. */
const CONSULTATION = [
  { when: "Today · about 5 minutes", title: "Getting to know you", body: "Your routine, your goal and what a normal day looks like." },
  { when: "After 3 days of meals", title: "What I've noticed so far", body: "The patterns in your meals, and one focus you pick together." },
  { when: "Around day 7", title: "Week-in-review", body: "A review of your week, and a plan for next week if you want one." },
];

/**
 * Real messages it sends on its own, as the app's own chat crops (PRE-283,
 * shot on the test account with the seeds that send them), captioned by the
 * moment rather than the rule that sends them. The protein message is the
 * funnel pack's egg-cups message, left as drawn (open with Charlie).
 */
const MESSAGES = [
  { tag: "Breakfast time", message: missedBreakfast, caption: "A gap in your day, the same morning." },
  { tag: "After 3 weeks", message: proteinShort, caption: "A pattern it's seen for a while." },
  { tag: "Every week", message: weeklyPattern, caption: "The same days, week after week." },
];

const LIMITS = [
  "It won't diagnose anything or change a dose.",
  "For anything medical, it points you to your GP, a pharmacist or a registered dietitian.",
  "It's an AI nutritionist, and it always says so.",
];

const chart = {
  ...appCapture("02-chat-chart", "The chat: protein per day for the last week as a bar chart, against a 158 g target"),
  width: 804,
  height: 1748,
};

/**
 * /features/ai-nutritionist (PRE-451, Charlie's site pages handoff,
 * docs/copy/02-nutritionist.md): the template for the five feature pages.
 * The hero still and its lifted focus picker are FeatureHeroStage; the
 * related tiles and the close come from the feature page route. In between:
 * the consultation, the messages it sends, Ask Nutritionist and its limits,
 * on alternating band and cream.
 */
export default function NutritionistFeature() {
  return (
    <>
      <V9Section id="consultation" name="consultation" labelledBy="consultation-heading" band>
        <div className="flex flex-col gap-10">
          <Head
            id="consultation-heading"
            label="Your free consultation"
            title="It starts with a 5-minute chat."
            lead="Three short chats across your first week. By the end it knows your routine, your goal and the one change worth making first."
          />
          <ol className="grid gap-4 min-[821px]:grid-cols-3">
            {CONSULTATION.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2 rounded-[22px] bg-surface p-[22px]">
                <span
                  aria-hidden
                  className="mb-1.5 grid h-[30px] w-[30px] place-items-center rounded-full bg-primary text-[13px] font-bold text-on-primary"
                >
                  {index + 1}
                </span>
                <span className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-ink-muted">{step.when}</span>
                <h3 className="font-display text-[22px] leading-tight text-ink">
                  <span className="sr-only">{index + 1}. </span>
                  {step.title}
                </h3>
                <p className="text-[15.5px] text-ink-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </V9Section>

      <V9Section id="speaks-up" name="speaks-up" labelledBy="speaks-up-heading">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 id="speaks-up-heading" className="font-display text-chapter text-ink text-balance">
              Then it speaks up before you slip.
            </h2>
            <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
              A good nutritionist doesn&apos;t wait for your next appointment to mention what they&apos;ve noticed. Neither
              does yours. These are real messages it sends.
            </p>
          </div>
          <ul className="grid max-w-[460px] items-start gap-[18px] min-[901px]:max-w-none min-[901px]:grid-cols-3">
            {MESSAGES.map((message) => (
              <li key={message.tag}>
                <figure className="flex flex-col gap-3">
                  <div className="relative pt-3">
                    <span className="absolute left-3.5 top-0 z-[1]">
                      <DotTag pill>{message.tag}</DotTag>
                    </span>
                    <Glass>
                      <CapturePicture capture={message.message.capture} />
                    </Glass>
                  </div>
                  <figcaption className="pl-1 text-[13.5px] text-ink-muted">{message.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="max-w-[60em] text-small text-ink-muted">
            A light touch: it stays quiet before 8am and after 9pm, pattern notes come every few weeks at most, and each
            kind of message has its own switch in Settings.
          </p>
        </div>
      </V9Section>

      <V9Section id="ask-nutritionist" name="ask-nutritionist" labelledBy="ask-heading" band>
        <Split
          reverse
          text={
            <>
              <Eyebrow>Ask Nutritionist</Eyebrow>
              <h2 id="ask-heading" className="font-display text-chapter text-ink text-balance">
                Talk it through, any hour.
              </h2>
              <div className="mt-2 flex flex-col gap-6">
                <YouSaid>“Can you show me my protein for the last week?”</YouSaid>
                <NutritionistSaid className="max-w-[30em] min-[480px]:ml-[clamp(0px,8vw,120px)]">
                  <p>
                    Here&apos;s your protein for the last 7 days. Lunch does most of the work, so breakfast is the easiest
                    place to add a few grams.
                  </p>
                </NutritionistSaid>
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip>Logs meals from chat</Chip>
                <Chip>Voice notes</Chip>
                <Chip>Every change waits for your yes</Chip>
              </div>
            </>
          }
          media={
            <div className="mx-auto w-[min(300px,78%)] overflow-hidden rounded-[30px] bg-white shadow-[var(--shadow-v9-card)] ring-1 ring-black/5">
              <CapturePicture capture={chart} />
            </div>
          }
        />
      </V9Section>

      <V9Section id="limits" name="limits" labelledBy="limits-heading">
        <div className="grid gap-x-14 gap-y-7 rounded-[28px] bg-primary p-[clamp(28px,5vw,56px)] text-on-primary min-[821px]:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-[12px] font-bold uppercase leading-none tracking-[0.12em] text-white/60">It knows its limits</p>
            <h2 id="limits-heading" className="font-display text-section text-white text-balance">
              A coach, not a doctor.
            </h2>
          </div>
          <ul>
            {LIMITS.map((limit) => (
              <li key={limit} className="flex gap-3 border-b border-white/12 py-1.5 text-body text-white/90 last:border-b-0">
                <span aria-hidden className="mt-[0.62em] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </V9Section>
    </>
  );
}
