import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureBlock from "@/components/features/FeatureBlock";
import Glow from "@/components/ui/Glow";
import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import TextLink from "@/components/ui/TextLink";
import { appCapture, appVideo } from "@/lib/captures";

const PHONE = "[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]";

const ALWAYS_ON = [
  {
    title: "Checks in",
    detail: "Haven't logged breakfast by your usual time? It asks, and your reply becomes a meal to confirm.",
  },
  {
    title: "Spots patterns",
    detail: "Short on protein three weeks running? It notices and suggests an easy, good-value fix.",
  },
  {
    title: "Asks when it's unsure",
    detail: "“Dinner at a restaurant” gets a quick question, so your day stays accurate.",
  },
  {
    title: "Reminds you to weigh in",
    detail: "When it's been a week, it asks. Reply with the number and confirm.",
  },
];

/**
 * /features/ai-nutritionist: chat, charts, Log it cards, voice notes, the
 * always-on nudges, consultation and weekly check-ins. Voice calls are left
 * out until they are on for everyone (copy doc, 13 Oct).
 */
export default function NutritionistFeature() {
  return (
    <>
      <FeatureBlock
        id="charts"
        tone="surface"
        title="Charts when a picture says it faster."
        lead="Ask “show my protein this week” and the chart appears right in the chat. Protein, carbs, fat or calories against your target, your macro split, your weight, or Energy, Satiety and Mood day by day."
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
        title="It logs, moves and fixes meals for you."
        lead="Tell it what you had and it prepares a Log it card. It can move a meal to another day, fix an amount and set your calorie, macro and water goals. You confirm every change before it's saved."
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
        <PointList
          layout="rows"
          points={[
            { title: "Log it", detail: "Say what you ate and when" },
            { title: "Move or fix", detail: "“That pasta was actually Saturday”" },
            { title: "Goals", detail: "Calories, macros and water" },
          ]}
        />
      </FeatureBlock>

      <FeatureBlock
        id="voice-notes"
        tone="surface"
        title="Talk, and hear a reply."
        lead="Send a voice note of up to two minutes, like on WhatsApp. Your nutritionist answers in its own voice, with the words written underneath, and any Log it card still appears under the reply."
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

      <Section id="always-on" labelledBy="always-on-heading">
        <div className="flex flex-col gap-stack">
          <SectionHeading
            id="always-on-heading"
            size="section"
            title="It doesn't wait for you to ask."
            lead="Your nutritionist watches your day the way a good one would, and speaks up when it matters."
          />
          <PointList layout="columns" columns={4} points={ALWAYS_ON} />
          <p className="text-small text-ink-faint">
            Missed-log nudges, pattern check-ins and weigh-in reminders each have a switch in Settings.
            It&apos;s a nutritionist, not a doctor, and it will tell you when something needs a professional.
          </p>
        </div>
      </Section>

      <FeatureBlock
        id="consultation"
        tone="surface"
        reverse
        title="A plan for you, not for everyone."
        lead="Start with a short consultation. Your nutritionist learns how you eat, agrees one or two things to focus on, and builds every reply around them."
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
        <PointList
          layout="rows"
          points={[
            { title: "Consultation", detail: "Three short chats in your first week" },
            { title: "Weekly check-in", detail: "How it went, and one focus for next week" },
            { title: "It remembers", detail: "Your focus, notes and last week's chat" },
          ]}
        />
        <TextLink href="/guides/consultation-and-weekly-check-in">
          Guide: your consultation and weekly check-in
        </TextLink>
      </FeatureBlock>
    </>
  );
}
