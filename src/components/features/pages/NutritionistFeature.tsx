import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureBlock from "@/components/features/FeatureBlock";
import ChatCapture from "@/components/ui/ChatCapture";
import Glow from "@/components/ui/Glow";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import SwipeRow from "@/components/ui/SwipeRow";
import TextLink from "@/components/ui/TextLink";
import { missedBreakfast, proteinShort, weeklyPattern, weighIn } from "@/content/nutritionistMessages";
import { appCapture, appVideo } from "@/lib/captures";
import { RESEARCH_PAGE_HREF } from "@/lib/research";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

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
          {/* Real messages cropped from the app's chat (PRE-283), one row you swipe on phones (PRE-285). */}
          <SwipeRow
            label="Messages your nutritionist sends on its own"
            itemClassName="w-[82%] max-w-[340px] lg:max-w-none lg:flex-1"
            className="lg:items-start"
          >
            {[missedBreakfast, proteinShort, weeklyPattern, weighIn].map((message) => (
              <ChatCapture key={message.caption} {...message} />
            ))}
          </SwipeRow>
          <p className="text-small text-ink-faint">
            It sends one of these at most once a day, and only when it&apos;s useful. Missed-log nudges, pattern
            check-ins, weekly calorie pattern ideas and weigh-in reminders each have a switch in Settings.
          </p>
        </div>
      </Section>

      <FeatureBlock
        id="consultation"
        reverse
        title="It gets to know you first."
        lead="It starts with a short consultation about how you eat now. After a few days of meals, it tells you what it noticed and agrees one thing to change first."
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
        lead="What to have for dinner, why you're hungry by 4pm, how to fit in a takeaway. It answers from what you actually ate, with a chart when that's quicker."
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
        lead="Mention a meal and it prepares a Log it card with the calories and macros worked out. It can also move a meal, fix an amount or change your goals."
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
          Any log, plan or goal change it makes from chat shows up as a card first, and nothing is saved until you tap it.
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
