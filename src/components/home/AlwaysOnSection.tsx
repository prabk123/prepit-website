import DeviceFrame from "@/components/device/DeviceFrame";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appVideo } from "@/lib/captures";

const ACTIONS = [
  { title: "Checks in", detail: "Haven't logged breakfast by your usual time? It asks, and one reply logs it." },
  { title: "Spots patterns", detail: "Short on protein three weeks running? It notices and suggests an easy, good-value fix." },
  { title: "Asks when it's unsure", detail: "“Dinner at a restaurant” gets a quick question, so your day stays accurate." },
  { title: "Suggests a better week", detail: "More room on the days you always go over, same weekly total." },
  { title: "Reminds you to weigh in", detail: "When it's been a week, it asks, and a number logs it." },
];

/** "It doesn't wait for you to ask": the nutritionist speaking up on its own. */
export default function AlwaysOnSection() {
  return (
    <Section id="nutritionist" labelledBy="always-on-heading" analyticsName="always-on">
      <FeatureSplit
        reverse
        media={
          <div className="relative">
            <Glow />
            <DeviceFrame
              className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]"
              video={appVideo(
                "09-chat-log-it",
                "Telling the nutritionist about a meal in chat and logging it from the Log it card",
              )}
            />
          </div>
        }
      >
        <SectionHeading
          id="always-on-heading"
          size="section"
          title="It doesn't wait for you to ask."
          lead="Your nutritionist watches your day the way a good one would, and speaks up when it matters."
        />
        <PointList points={ACTIONS} />
        <p className="text-small text-ink-faint">
          It&apos;s a nutritionist, not a doctor, and it will tell you when something needs a professional.
        </p>
      </FeatureSplit>
    </Section>
  );
}
