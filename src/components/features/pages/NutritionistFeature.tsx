import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureBlock from "@/components/features/FeatureBlock";
import Glow from "@/components/ui/Glow";
import QuoteCard from "@/components/ui/QuoteCard";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { appCapture, appVideo } from "@/lib/captures";
import { RESEARCH_PAGE_HREF } from "@/lib/research";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

/**
 * Messages the nutritionist sends on its own, worded as the app sends them
 * (fresca_backend src/services/proactiveNudges.ts). The numbers in the second
 * and third are an example person's.
 */
const SPEAKS_UP = [
  {
    quote:
      "I can't see any breakfast log today. Drop me a quick voice note when you get the chance if you had something, or let me know if you skipped it :)",
    name: "When breakfast isn't logged by your usual time",
  },
  {
    quote:
      "Over the past few weeks protein has been a little low. Most of the gap is at dinner, which averages about 20g. Two easy fixes that don't change what you cook: a bigger portion of the protein you already have at dinner, or a pot of Greek yogurt after dinner. Want to try one?",
    name: "When the same gap shows up three weeks running",
  },
  {
    quote:
      "Tuesdays and Wednesdays have run about 500 kcal over your goal in most of the last four weeks, while the rest of the week sits close to it. That's completely normal when some days are busier or more social.",
    name: "When the same days keep going over, with a plan to give them more room",
  },
];

/**
 * /features/ai-nutritionist: standout 1, "knows you and speaks up". It leads
 * with the messages it sends on its own, then how it gets to know you, then
 * what you can ask it. Voice calls are left out until they are on for
 * everyone (copy doc, 13 Oct).
 */
export default function NutritionistFeature() {
  return (
    <>
      <Section id="speaks-up" tone="surface" labelledBy="speaks-up-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="speaks-up-heading"
            size="section"
            title="It speaks up before you slip."
            lead="A good nutritionist doesn't wait for your next appointment to mention what they've noticed. Neither does yours. These are real messages it sends on its own."
          />
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
            {SPEAKS_UP.map((message) => (
              <QuoteCard key={message.name} quote={message.quote} name={message.name} />
            ))}
          </div>
          <p className="text-small text-ink-faint">
            It sends one of these at most once a day, and only when it&apos;s useful. Missed-log nudges, pattern
            check-ins and weigh-in reminders each have a switch in Settings.
          </p>
        </div>
      </Section>

      <FeatureBlock
        id="consultation"
        reverse
        title="It gets to know you first."
        lead="You start with a short consultation about how you eat now. Once it has seen a few days of your meals, your nutritionist tells you what it noticed and agrees one thing to change first."
        media={
          <div className="relative">
            <Glow />
            <DevicePair className={PHONE}>
              <DeviceFrame
                capture={appCapture(
                  "20-focus-picker",
                  "Pick your focus: front-load protein at breakfast, even out the day, or make snacks work harder",
                )}
              />
              <DeviceFrame
                className="hidden sm:block"
                capture={appCapture(
                  "11-check-in-report",
                  "A weekly check-in report headed Your steadiest week yet, with weight against a goal and calories by day",
                )}
              />
            </DevicePair>
          </div>
        }
      >
        <p className="max-w-[56ch] text-body text-ink-muted text-pretty">
          Every week after that, a check-in looks back at what you logged and picks one focus for the week ahead.
          You can keep it, pick another or talk it through. It remembers your goals, your notes and what you told
          it last week, so you never start from scratch.
        </p>
        <TextLink href="/guides/consultation-and-weekly-check-in">
          Guide: your consultation and weekly check-in
        </TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="charts"
        tone="surface"
        title="Ask it anything about your week."
        lead="What to have for dinner, why you're hungry by 4pm, how to fit in a takeaway. It answers from what you actually ate, and when a picture says it faster, it draws a chart right in the chat."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "02-chat-chart",
                "The nutritionist answering a question about protein with a chart of protein per day against a 158 g target",
              )}
            />
          </div>
        }
      >
        <TextLink href="/guides/ask-your-nutritionist">Guide: ask your nutritionist</TextLink>
      </FeatureBlock>

      <FeatureBlock
        id="log-it"
        reverse
        title="Tell it what you had. It does the rest."
        lead="Mention a meal in chat and it prepares a Log it card with the calories and macros worked out. It can also move a meal to another day, fix an amount or change your calorie, macro and water goals."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              video={appVideo("09-chat-log-it", "Telling the nutritionist about a meal and logging it from the Log it card")}
            />
          </div>
        }
      >
        <p className="max-w-[56ch] text-body text-ink-muted text-pretty">
          Anything it changes for you from chat shows up as a card first, and nothing is saved until you tap it.
        </p>
      </FeatureBlock>

      <FeatureBlock
        id="voice-notes"
        layout="peek"
        tone="surface"
        title="Talk, and hear a reply."
        lead="Send a voice note of up to two minutes, like on WhatsApp. Your nutritionist answers in its own voice, with the words written underneath."
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className={PHONE}
              capture={appCapture(
                "10-voice-note",
                "A voice note asking to log a chicken burrito bowl, a spoken reply and a Log it card for 674 kcal",
              )}
            />
          </div>
        }
      />

      <Section id="limits" labelledBy="limits-heading">
        <div className="flex flex-col gap-6">
          <SectionHeading
            id="limits-heading"
            size="title"
            title="A nutritionist, not a doctor."
            lead="It won't diagnose anything or suggest a dose beyond the public reference amount. For anything medical, it points you to your GP, a pharmacist or a registered dietitian."
          />
          <TextLink href={RESEARCH_PAGE_HREF}>How your nutritionist decides what to say</TextLink>
        </div>
      </Section>
    </>
  );
}
