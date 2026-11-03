import ScreenCard from "@/components/features/ScreenCard";
import { Chip, Split, V9Section } from "@/components/landing/v9/V9Sections";
import { appCapture } from "@/lib/captures";

/**
 * A still, not the 04-log-photo clip: the clip goes on to a "When did you eat
 * this?" sheet with a Confirm button, and typed or photo meals save straight
 * away. Its poster is the result screen, so this is a frame from 9.5 s.
 */
const describe = appCapture("04b-log-photo-describe", "A plate photo on the Describe your meal sheet, with “homemade, about 400 g” typed under it");

const detail = appCapture("05-meal-detail", "A logged breakfast broken into its ingredients, each with its own numbers");

/** The live page's accuracy and offline points, as one row of four (docs/copy/05-logging.md, section 4). */
const POINTS = [
  ["Official figures first.", "Branded and restaurant food starts from the brand's own numbers."],
  ["It asks when it's unsure.", "“Dinner at a restaurant” gets a quick question, so your day stays accurate."],
  ["Easy to fix.", "Edit any item, or ask your nutritionist to change it."],
  ["No signal? Log anyway.", "On a train or a flight, it saves on your phone and sends when you're back."],
];

/**
 * /features/logging (PRE-454, from Charlie's site pages handoff): a few
 * words get it closer, snap your plate, then the accuracy and offline points
 * in one row. The header's still and lifted cards are in FeatureHeroStage.
 * Typed, spoken and photo meals go on the log straight away and the numbers
 * follow, so nothing here says you confirm before it saves. Siri and the
 * Action button live on Widgets and Siri.
 */
export default function LoggingFeature() {
  return (
    <>
      <V9Section id="describe-it" name="logging-describe" labelledBy="describe-it-heading" band aliases={["type-it"]}>
        <Split
          reverse
          text={
            <>
              <h2 id="describe-it-heading" className="font-display text-chapter text-ink text-balance">
                A few words get it closer.
              </h2>
              <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
                There&apos;s no database to search and no barcode to find. Add how much, how it was cooked or the brand, and
                the numbers get much closer to the truth.
              </p>
              <div className="flex flex-wrap gap-2">
                <Chip>Every ingredient itemised</Chip>
                <Chip>Edit any item</Chip>
              </div>
            </>
          }
          media={
            <ScreenCard ring capture={detail} />
          }
        />
      </V9Section>

      <V9Section id="snap-it" name="logging-photo" labelledBy="snap-it-heading">
        <Split
          text={
            <>
              <h2 id="snap-it-heading" className="font-display text-chapter text-ink text-balance">
                Or just snap your plate.
              </h2>
              <p className="max-w-[34em] text-lead text-ink-secondary text-pretty">
                Take a photo and PrepIt works out what&apos;s on it. Add a few words, like the restaurant or the portion, and it
                uses both.
              </p>
            </>
          }
          media={
            <ScreenCard ring capture={describe} />
          }
        />
      </V9Section>

      <V9Section id="accuracy" name="logging-accuracy" labelledBy="accuracy-heading" band aliases={["offline"]}>
        <div className="flex flex-col gap-8">
          <h2 id="accuracy-heading" className="font-display text-section text-ink text-balance">
            Close to the truth, and easy to fix.
          </h2>
          <ul className="grid border-t border-line-strong min-[521px]:grid-cols-2 min-[901px]:grid-cols-4">
            {POINTS.map(([heading, body]) => (
              <li
                key={heading}
                className="border-b border-line py-5 pr-3.5 min-[901px]:border-b-0 min-[901px]:border-r min-[901px]:px-[22px] min-[901px]:pb-1.5 min-[901px]:first:pl-0 min-[901px]:last:border-r-0"
              >
                <h3 className="mb-2.5 font-display text-[22px] font-medium leading-tight text-ink">{heading}</h3>
                <p className="text-[15.5px] text-ink-secondary">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </V9Section>
    </>
  );
}
