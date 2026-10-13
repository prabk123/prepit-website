import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import { BentoTile } from "@/components/ui/Bento";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appCapture, appVideo } from "@/lib/captures";

const ACTIONS = [
  { title: "Checks in", detail: "Haven't logged breakfast by your usual time? It asks, and one reply logs it." },
  { title: "Spots patterns", detail: "Short on protein three weeks running? It notices and suggests an easy fix." },
  { title: "Asks when it's unsure", detail: "“Dinner at a restaurant” gets a quick question, so your day stays accurate." },
  { title: "Suggests a better week", detail: "More room on the days you always go over, same weekly total." },
  { title: "Reminds you to weigh in", detail: "When it's been a week, it asks, and a number logs it." },
];

const PERSONAL = [
  { title: "A consultation to start", detail: "Pick what to focus on first, like protein at breakfast or evening snacking." },
  { title: "A weekly check-in", detail: "A short report on how your week went and one focus for the next." },
  { title: "It remembers", detail: "Your focus, your notes and what you said last week shape what it says next." },
];

/** "It doesn't wait for you to ask": the proactive nutritionist, then consultation and check-in. */
export default function AlwaysOnSection() {
  return (
    <Section id="nutritionist" labelledBy="always-on-heading" analyticsName="always-on">
      <div className="flex flex-col gap-stack">
        <FeatureSplit
          reverse
          media={
            <div className="relative">
              <Glow />
              <DevicePair className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]">
                <DeviceFrame
                  video={appVideo(
                    "09-chat-log-it",
                    "Telling the nutritionist about a meal in chat and logging it from the Log it card",
                  )}
                />
                <DeviceFrame
                  className="hidden sm:block"
                  capture={appCapture(
                    "11-check-in-report",
                    "A weekly check-in report: your steadiest week yet, with goal pace and calories",
                  )}
                />
              </DevicePair>
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
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {PERSONAL.map((item) => (
            <BentoTile key={item.title} title={item.title}>
              {item.detail}
            </BentoTile>
          ))}
        </div>
      </div>
    </Section>
  );
}
