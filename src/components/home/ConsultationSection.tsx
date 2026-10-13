import DeviceFrame from "@/components/device/DeviceFrame";
import DevicePair from "@/components/device/DevicePair";
import FeatureSplit from "@/components/ui/FeatureSplit";
import Glow from "@/components/ui/Glow";
import PointList from "@/components/ui/PointList";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { appCapture } from "@/lib/captures";

const PERSONAL = [
  { title: "Consultation", detail: "Pick your main focus, like protein at breakfast or evening snacking." },
  { title: "Weekly check-in", detail: "Each week, a short report on how it went and one focus for the next." },
  { title: "It remembers", detail: "Your focus, your notes and what you told it last week shape what it says next." },
];

/** "A plan for you, not for everyone": the consultation and weekly check-in. */
export default function ConsultationSection() {
  return (
    <Section id="consultation" labelledBy="consultation-heading" analyticsName="consultation">
      <FeatureSplit
        media={
          <div className="relative">
            <Glow />
            <DevicePair className="[--device-w:260px] sm:[--device-w:300px] lg:[--device-w:clamp(260px,22vw,320px)]">
              <DeviceFrame
                capture={appCapture(
                  "20-focus-picker",
                  "The consultation's focus picker: front-load protein at breakfast, even out the day, or make snacks work harder",
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
          id="consultation-heading"
          size="section"
          title="A plan for you, not for everyone."
          lead="Start with a short consultation. Your nutritionist learns how you eat, agrees one or two things to focus on, and builds every reply around them."
        />
        <PointList points={PERSONAL} />
      </FeatureSplit>
    </Section>
  );
}
