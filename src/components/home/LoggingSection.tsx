import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appVideo } from "@/lib/captures";

const WAYS = [
  { title: "Type it", detail: "“chicken wrap, an apple and a flat white”" },
  { title: "Snap it", detail: "A photo of your plate" },
  { title: "Say it", detail: "“Hey Siri, log a meal in PrepIt”" },
  { title: "One press", detail: "Action button and Lock Screen" },
  { title: "No signal", detail: "It sends when you're back" },
];

/** "The easiest logging you'll ever do": typed and photo logs as real recordings. */
export default function LoggingSection() {
  return (
    <Section id="logging" labelledBy="logging-heading" analyticsName="logging">
      <FeatureSplit
        media={
          <div className="relative">
            <Glow />
            <DevicePair className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]">
              <DeviceFrame
                video={appVideo("03-log-typed", "Typing a meal in plain words and PrepIt building the log with its macros")}
              />
              <DeviceFrame
                className="hidden sm:block"
                video={appVideo("04-log-photo", "Logging a meal from a photo of the plate")}
              />
            </DevicePair>
          </div>
        }
      >
        <SectionHeading
          id="logging-heading"
          size="section"
          title="The easiest logging you'll ever do."
          lead="Describe it, snap it or say it. PrepIt looks for official brand and restaurant figures first, and nothing is logged until you confirm."
        />
        <PointList layout="rows" points={WAYS} />
      </FeatureSplit>
    </Section>
  );
}
